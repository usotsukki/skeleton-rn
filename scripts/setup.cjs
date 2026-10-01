#!/usr/bin/env node
// Turns the template into your app: optional new identity, then pick the demos and starter packages to
// remove. Interactive by default; scriptable for CI and agents.
//
//   yarn setup                                  # asks
//   yarn setup --list                           # modules and what they remove
//   yarn setup --remove map,skia --dry-run      # preview
//   yarn setup --keep notifications --yes       # remove everything else, no questions
//   yarn setup --identity "Todo" todo todo com.acme.todo --remove all --yes --install
//
// Options: --remove <ids|all>, --keep <ids> (remove the rest), --identity <name> <slug> <scheme> <bundle-id>,
// --yes (never reads the terminal), --dry-run (no writes, no subprocesses), --install (yarn install after),
// --force (allow a dirty git tree).
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline/promises')
const { groups, modules } = require('./setup/modules.cjs')
const { planSetup, readRemoved, REMOVED_FILE } = require('./setup/plan.cjs')

const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)

function fail(message) {
	console.error(`setup: ${message}`)
	process.exit(1)
}

function option(name, count = 1) {
	const index = args.indexOf(name)
	if (index === -1) return undefined
	const values = args.slice(index + 1, index + 1 + count)
	if (values.length < count || values.some(v => v.startsWith('--'))) fail(`${name} needs ${count} value(s)`)
	return count === 1 ? values[0] : values
}

const flags = {
	list: args.includes('--list'),
	yes: args.includes('--yes'),
	dryRun: args.includes('--dry-run'),
	install: args.includes('--install'),
	force: args.includes('--force'),
	remove: option('--remove'),
	keep: option('--keep'),
	identity: option('--identity', 4),
}

const ids = value =>
	new Set(
		value
			.split(',')
			.map(s => s.trim())
			.filter(Boolean),
	)

function printModules() {
	const removed = readRemoved(io)
	let n = 0
	for (const group of groups) {
		console.log(`\n${group.title}`)
		for (const m of group.modules) {
			n += 1
			const status = removed.has(m.id) ? ' (removed)' : ''
			console.log(`  ${String(n).padStart(2)}. ${m.id.padEnd(20)} ${m.description}${status}`)
		}
	}
}

/**
 * Windows runs `yarn` / `npx` through .cmd shims, which spawnSync finds only with a shell. Only those:
 * a shell would split `C:\Program Files\…\node.exe` and let cmd interpret an app name like `A & B`.
 */
const SHIMMED = new Set(['yarn', 'npx'])
const run = (command, commandArgs, options = {}) =>
	childProcess.spawnSync(command, commandArgs, {
		cwd: root,
		shell: process.platform === 'win32' && SHIMMED.has(command),
		...options,
	})

function git(...gitArgs) {
	return run('git', gitArgs, { encoding: 'utf8' })
}

const isGitRepo = () => git('rev-parse', '--is-inside-work-tree').status === 0

// Without git (e.g. `npx degit`): walk the tree, skipping generated and dependency folders.
const WALK_SKIP = new Set(['.git', 'node_modules', 'ios', 'android', 'coverage', 'cpd', 'dist', '.expo', '.yarn'])
function walk(dir = '') {
	return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
		const rel = dir ? `${dir}/${entry.name}` : entry.name
		if (entry.isDirectory()) return WALK_SKIP.has(entry.name) || rel === '.claude/worktrees' ? [] : walk(rel)
		return entry.isFile() ? [rel] : []
	})
}

const io = {
	read: file => {
		try {
			return fs.readFileSync(path.join(root, file), 'utf8')
		} catch {
			return undefined
		}
	},
	exists: file => fs.existsSync(path.join(root, file)),
	list: () => {
		if (!isGitRepo()) return walk()
		const listed = git('ls-files', '-co', '--exclude-standard')
		if (listed.status !== 0) fail(`git ls-files failed: ${listed.stderr}`)
		return listed.stdout.split('\n').filter(Boolean)
	},
}

async function ask(rl, question) {
	return (await rl.question(question)).trim()
}

async function askIdentity(rl) {
	const name = await ask(rl, '\nApp name (Enter keeps the current identity): ')
	if (!name) return undefined
	const slugDefault = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
	const slug = (await ask(rl, `Slug [${slugDefault}]: `)) || slugDefault
	const schemeDefault = slug.replace(/-/g, '')
	const scheme = (await ask(rl, `URL scheme [${schemeDefault}]: `)) || schemeDefault
	const bundleDefault = `com.example.${schemeDefault}`
	const bundleId = (await ask(rl, `Bundle id / package [${bundleDefault}]: `)) || bundleDefault
	return [name, slug, scheme, bundleId]
}

async function askRemovals(rl) {
	printModules()
	const answer = await ask(rl, '\nNumbers or ids to remove (e.g. "1 2 luxon"), "all", or Enter for none: ')
	if (answer === 'all') return new Set(modules.map(m => m.id))
	const picked = new Set()
	for (const token of answer.split(/[\s,]+/).filter(Boolean)) {
		const byNumber = modules[Number(token) - 1]
		const m = /^\d+$/.test(token) ? byNumber : modules.find(x => x.id === token)
		if (!m) fail(`no module "${token}"`)
		picked.add(m.id)
	}
	return picked
}

function selectionFromFlags() {
	if (flags.remove && flags.keep) fail('use --remove or --keep, not both')
	if (flags.remove) return flags.remove === 'all' ? new Set(modules.map(m => m.id)) : ids(flags.remove)
	if (flags.keep) {
		const keep = ids(flags.keep)
		const unknown = [...keep].filter(id => !modules.some(m => m.id === id))
		// A typo here would remove the module it meant to keep.
		if (unknown.length) fail(`unknown module(s) in --keep: ${unknown.join(', ')} (yarn setup --list)`)
		return new Set(modules.map(m => m.id).filter(id => !keep.has(id)))
	}
	return undefined
}

async function main() {
	if (flags.list) {
		printModules()
		return
	}

	// Prompts only on a terminal without --yes; otherwise everything comes from flags.
	const interactive = !flags.yes && !!process.stdin.isTTY
	if (!interactive && !flags.dryRun && !flags.yes) fail('no terminal: pass --yes with --remove/--keep (and --identity)')
	if (!interactive && !flags.remove && !flags.keep && !flags.identity) fail('pass --remove/--keep and/or --identity')

	if (!flags.dryRun && !flags.force) {
		if (!isGitRepo())
			fail('not a git repository: nothing to undo setup with; `git init && git commit` first (or pass --force)')
		if (git('status', '--porcelain').stdout.trim()) {
			fail('the git tree has uncommitted changes; commit or stash them first (or pass --force)')
		}
	}

	const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : undefined
	try {
		const identity = flags.identity ?? (rl ? await askIdentity(rl) : undefined)
		const remove = selectionFromFlags() ?? (rl ? await askRemovals(rl) : new Set())

		const plan = planSetup(io, { modules, remove, resetVersion: !!identity })
		if (plan.errors.length) fail(`nothing changed:\n  ${plan.errors.join('\n  ')}`)

		console.log('\nPlan:')
		if (identity) console.log(`  rename to "${identity[0]}" (${identity.slice(1).join(', ')}) via scripts/rename.cjs`)
		for (const change of plan.changes) console.log(`  ${change}`)
		if (!identity && plan.changes.length === 0 && !plan.removedRecord) {
			console.log('  nothing to do')
			return
		}
		if (flags.dryRun) {
			console.log('\nDry run: nothing was written.')
			return
		}
		if (rl && (await ask(rl, '\nApply? [y/N] ')).toLowerCase() !== 'y') {
			console.log('Cancelled; nothing was written.')
			return
		}

		if (identity) {
			const renamed = run(process.execPath, [path.join(__dirname, 'rename.cjs'), ...identity], { stdio: 'inherit' })
			if (renamed.status !== 0) fail('rename failed; no modules were removed')
		}
		// Re-plan after the rename: it rewrote package.json and app.json.
		const final = identity ? planSetup(io, { modules, remove, resetVersion: true }) : plan
		if (final.errors.length) fail(`modules not removed:\n  ${final.errors.join('\n  ')}`)
		for (const [file, content] of final.writes) fs.writeFileSync(path.join(root, file), content)
		for (const p of final.deletes) fs.rmSync(path.join(root, p), { recursive: true, force: true })
		// Removing a block can leave formatting Prettier would change (e.g. a now-short import list).
		const formatted = run('npx', ['--no-install', 'prettier', '--write', ...final.writes.keys()], { stdio: 'ignore' })
		if (formatted.status !== 0) console.warn('setup: prettier did not run; `yarn fix` will format the edited files')
		console.log(`\nsetup: ${final.writes.size} files edited, ${final.deletes.length} deleted`)

		// Required, and on every applied run (fast, no linking): a lockfile that still lists removed packages
		// fails `yarn install --immutable` in CI, and a run stopped here left it stale.
		const lock = run('yarn', ['install', '--mode=update-lockfile'], { stdio: 'inherit' })
		if (lock.status !== 0) fail('yarn.lock is out of date; run `yarn` before committing')
		// Last: a run stopped before this point leaves the modules unrecorded, so the next run finishes them.
		if (final.removedRecord) fs.writeFileSync(path.join(root, REMOVED_FILE), final.removedRecord)
		const install = flags.install || (rl && (await ask(rl, 'Run yarn install now? [Y/n] ')).toLowerCase() !== 'n')
		if (install && run('yarn', ['install'], { stdio: 'inherit' }).status !== 0) {
			fail('yarn install failed')
		}

		console.log('\nNext:')
		console.log('  yarn fix && yarn check')
		if (final.nativeChanged || identity) {
			console.log('  npx expo prebuild --clean   (native modules or identity changed), then yarn dev')
		}
	} finally {
		rl?.close()
	}
}

main().catch(error => fail(error instanceof Error ? error.message : String(error)))
