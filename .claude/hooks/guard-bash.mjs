#!/usr/bin/env node
// PreToolUse(Bash) guard: blocks commands that repeatedly caused damage in agent sessions.
// Exit 2 + stderr = deny (reason shown to the agent). Commands are tokenized like the shell does
// (quotes, escapes, separators), so checks see real argv: `"-n"` is a flag, `-m "… -n …"` is text.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const ATTRIBUTION =
	/(co-authored-by:.*(claude|cursor|anthropic|openai|codex|copilot)|generated with \[?(claude|cursor))/i

const raw = readFileSync(0, 'utf8')
let cmd = raw
let cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd()
let parsed = false
try {
	const input = JSON.parse(raw)
	cmd = String(input.tool_input?.command ?? '')
	if (typeof input.cwd === 'string' && input.cwd) cwd = input.cwd
	parsed = true
} catch {
	// Unparseable input: scan it as-is rather than allowing everything.
}
if (!cmd.trim()) process.exit(0)

function deny(reason) {
	process.stderr.write(`guard-bash: ${reason}\n`)
	process.exit(2)
}

// Split into simple commands (argv arrays) at ; & | ( ) ` and newlines outside quotes.
// Redirections (`2>&1`, `>/dev/null`, `< file`) are dropped: they are not arguments.
function tokenize(src) {
	const segments = [[]]
	let tok = null
	const push = () => {
		if (tok !== null) segments.at(-1).push(tok)
		tok = null
	}
	for (let i = 0; i < src.length; ) {
		const c = src[i]
		if (c === "'") {
			const end = src.indexOf("'", i + 1)
			const stop = end < 0 ? src.length : end
			tok = (tok ?? '') + src.slice(i + 1, stop)
			i = stop + 1
		} else if (c === '"') {
			let s = ''
			for (i++; i < src.length && src[i] !== '"'; i++) s += src[i] === '\\' && i + 1 < src.length ? src[++i] : src[i]
			tok = (tok ?? '') + s
			i++
		} else if (c === '\\' && src[i + 1] === '\n') {
			i += 2 // line continuation
		} else if (c === '\\' && i + 1 < src.length) {
			tok = (tok ?? '') + src[i + 1]
			i += 2
		} else if (c === '>' || c === '<') {
			if (tok !== null && /^\d+$/.test(tok)) tok = null
			push()
			while (i < src.length && '<>&|'.includes(src[i])) i++
			while (src[i] === ' ' || src[i] === '\t') i++
			while (i < src.length && !/\s/.test(src[i]) && !';&|()`'.includes(src[i])) i++
		} else if (/\s/.test(c) || ';&|()`'.includes(c)) {
			push()
			if (c !== ' ' && c !== '\t') segments.push([])
			i++
		} else {
			tok = (tok ?? '') + c
			i++
		}
	}
	push()
	return segments.filter(s => s.length)
}

const SHELL_KEYWORDS = ['if', 'then', 'else', 'elif', 'while', 'until', 'do', '{', '!']
const WRAPPERS = ['command', 'env', 'exec', 'time', 'nohup']

// Strip env assignments and wrappers; expand `bash -c "…"` / `eval …` into their own commands.
function commands(src, depth = 0) {
	const out = []
	for (let argv of tokenize(src)) {
		// Unparsed input has no command boundary at the start: begin at the first known command.
		if (!parsed)
			argv = argv.slice(
				Math.max(
					0,
					argv.findIndex(a => /^(git|gh|export|HUSKY=|.*lint-staged$)/.test(a)),
				),
			)
		// Leading shell keywords, env assignments and wrappers (with their options) in any order:
		// `if …; then env HUSKY=0 /usr/bin/git …` is still a git command with HUSKY=0.
		const env = {}
		for (let wrapped = false; argv.length; ) {
			if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(argv[0])) {
				const [k, ...v] = argv.shift().split('=')
				env[k] = v.join('=')
			} else if (SHELL_KEYWORDS.includes(argv[0])) {
				argv = argv.slice(1)
				wrapped = false
			} else if (WRAPPERS.includes(argv[0])) {
				argv = argv.slice(1)
				wrapped = true
			} else if (wrapped && argv[0].startsWith('-')) argv = argv.slice(1)
			else break
		}
		if (argv.length && argv[0].includes('/')) argv = [basename(argv[0]), ...argv.slice(1)]
		if (depth < 3 && ['bash', 'sh', 'zsh'].includes(argv[0])) {
			const c = argv.findIndex(a => /^-[a-z]*c$/.test(a))
			if (c > 0 && argv[c + 1]) out.push(...commands(argv[c + 1], depth + 1))
		}
		if (depth < 3 && argv[0] === 'eval') out.push(...commands(argv.slice(1).join(' '), depth + 1))
		if (argv.length) out.push({ argv, env })
	}
	return out
}

// git [global opts] <sub> <args>; returns null for non-git commands.
function parseGit(argv) {
	if (argv[0] !== 'git') return null
	const config = []
	let otherDir = false
	let dir = cwd
	let i = 1
	for (; i < argv.length && argv[i].startsWith('-'); i++) {
		const a = argv[i]
		if (a === '-c') config.push(argv[++i] ?? '')
		else if (a.startsWith('-c')) config.push(a.slice(2))
		else if (a === '-C') dir = resolve(dir, argv[++i] ?? '.')
		else if (a === '--git-dir' || a === '--work-tree') (otherDir = true), i++
		else if (/^--(git-dir|work-tree)=/.test(a)) otherDir = true
	}
	// `-C <path inside this repo>` still acts on this checkout.
	if (dir !== cwd && toplevel(dir) !== toplevel(cwd)) otherDir = true
	return { sub: argv[i], args: argv.slice(i + 1), config, otherDir }
}

// Walk options; `valued` options consume a value (attached or next token), `attached` ones only an
// attached value (`-uno`, `-S<key>`). Returns flags, values, positionals.
function parseArgs(args, valued, attached = new Set()) {
	const flags = new Set()
	const values = []
	const positionals = []
	let afterDashes = null
	for (let i = 0; i < args.length; i++) {
		const a = args[i]
		if (a === '--') {
			afterDashes = args.slice(i + 1)
			break
		}
		if (a.startsWith('--')) {
			const [name, val] = a.split(/=(.*)/s)
			flags.add(name)
			if (valued.has(name)) values.push([name, val ?? args[++i] ?? ''])
		} else if (a.startsWith('-') && a.length > 1) {
			for (let j = 1; j < a.length; j++) {
				const f = `-${a[j]}`
				flags.add(f)
				if (attached.has(f)) break
				if (valued.has(f)) {
					values.push([f, a.slice(j + 1) || args[++i] || ''])
					break
				}
			}
		} else positionals.push(a)
	}
	return { flags, values, positionals, afterDashes }
}

const SETTINGS = resolve(cwd, '.claude/settings.json')
const git = (...args) => spawnSync('git', args, { cwd, stdio: 'ignore' }).status
const toplevel = dir =>
	spawnSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout?.trim() || dir
const fileHasAttribution = path => {
	if (!path || path === '-') return false
	const full = resolve(cwd, path)
	try {
		return existsSync(full) && ATTRIBUTION.test(readFileSync(full, 'utf8'))
	} catch {
		return false // directory / unreadable: git itself will reject it
	}
}

const COMMIT_VALUED = new Set(
	['-m', '-F', '-C', '-c', '-t', '--message', '--file', '--template', '--reuse-message', '--reedit-message'].concat([
		'--author',
		'--date',
		'--fixup',
		'--squash',
		'--cleanup',
		'--trailer',
		'--pathspec-from-file',
	]),
)
const COMMIT_ATTACHED = new Set(['-u', '-S'])
// git accepts unambiguous long-option prefixes: `--no-v` … `--no-verify`.
const isNoVerify = flag => flag.length >= '--no-v'.length && '--no-verify'.startsWith(flag)
const SWITCH_VALUED = new Set(['-c', '-C', '--create', '--force-create', '--orphan', '--conflict'])
const CHECKOUT_VALUED = new Set(['-b', '-B', '--orphan', '--conflict'])

for (const { argv, env } of commands(cmd)) {
	// 1. Skipping git hooks: HUSKY=0, core.hooksPath, --no-verify / -n on commit.
	// HUSKY=0 on a wrapper (`HUSKY=0 bash -c 'git …'`, `env HUSKY=0 bash -c …`) never
	// reaches the inner git argv, so deny it on every command, not only git.
	if (argv[0] === 'export' && argv.some(a => /^HUSKY=0$/.test(a)))
		deny("don't disable husky; fix what the hooks report.")
	if (env.HUSKY === '0') deny("don't disable husky; fix what the hooks report.")
	const g = parseGit(argv)
	if (g) {
		if (g.config.some(c => /^core\.hookspath/i.test(c))) deny("don't bypass git hooks; fix what they report.")
		if (Object.entries(env).some(([k, v]) => /^GIT_CONFIG_(KEY_\d+|PARAMETERS)$/.test(k) && /core\.hookspath/i.test(v)))
			deny("don't bypass git hooks; fix what they report.")
		// Persistent form; reading or unsetting it is fine.
		const reads = ['get', 'unset', 'list', '--get', '--get-all', '--unset', '--list', '-l']
		if (g.sub === 'config' && g.args.some(a => /^core\.hookspath/i.test(a)) && !g.args.some(a => reads.includes(a)))
			deny("don't bypass git hooks; fix what they report.")
		if (g.sub === 'merge' && g.args.some(a => a.startsWith('--') && isNoVerify(a)))
			deny("don't bypass git hooks; fix what they report.")
	}

	// 2. AI attribution in commit / PR text (inline, heredoc, or message file).
	if (g?.sub === 'commit') {
		const { flags, values } = parseArgs(g.args, COMMIT_VALUED, COMMIT_ATTACHED)
		if (flags.has('-n') || [...flags].some(isNoVerify)) deny("don't bypass git hooks; fix what they report.")
		if (ATTRIBUTION.test(cmd)) deny('remove AI attribution from the commit text.')
		for (const [f, v] of values)
			if ((f === '-F' || f === '--file') && fileHasAttribution(v)) deny(`remove AI attribution from ${v}.`)
	}
	if (argv[0] === 'gh' && argv[1] === 'pr' && ['create', 'edit'].includes(argv[2])) {
		if (ATTRIBUTION.test(cmd)) deny('remove AI attribution from the PR text.')
		const { values } = parseArgs(argv.slice(3), new Set(['-F', '--body-file', '-b', '--body', '-t', '--title']))
		for (const [f, v] of values)
			if ((f === '-F' || f === '--body-file') && fileHasAttribution(v)) deny(`remove AI attribution from ${v}.`)
	}

	// 3. lint-staged --diff stages every processed file as a side effect.
	const RUNNERS = ['npx', 'yarn', 'pnpm', 'bunx', 'npm', 'bun', 'node', 'exec', 'dlx', 'run']
	const ls = argv.findIndex(a => /(^|\/)lint-staged(@[^/]*)?$/.test(a))
	if (
		ls >= 0 &&
		argv.slice(0, ls).every(a => RUNNERS.includes(a) || a.startsWith('-')) &&
		argv.slice(ls + 1).some(a => a === '--diff' || a.startsWith('--diff='))
	) {
		deny('lint-staged --diff stages files; inspect .lintstagedrc.mjs output via node instead.')
	}

	// 4. Checking out a ref whose .claude/settings.json differs swaps the permission policy mid-task.
	if (g && !g.otherDir && (g.sub === 'switch' || g.sub === 'checkout')) {
		const isSwitch = g.sub === 'switch'
		const { flags, values, positionals, afterDashes } = parseArgs(g.args, isSwitch ? SWITCH_VALUED : CHECKOUT_VALUED)
		const creates = values.some(([f]) => f !== '--conflict')
		let target = null
		if (creates) target = positionals[0] ?? 'HEAD'
		else if (isSwitch) target = positionals[0]
		else if (!afterDashes?.length && positionals.length === 1) target = positionals[0]
		// Path checkout (`<ref> [--] <paths>`): only matters when it can replace the settings file itself.
		else if (
			[...positionals.slice(1), ...(afterDashes ?? [])].some(
				p => resolve(cwd, p) === SETTINGS || SETTINGS.startsWith(`${resolve(cwd, p)}/`),
			)
		)
			target = positionals[0]
		if (target === '-') target = '@{-1}'
		// `switch --orphan` deletes every tracked file, including this hook's settings.
		// `checkout --orphan <new> <start>` still checks <start> below (HEAD if omitted).
		if (isSwitch && flags.has('--orphan'))
			deny(
				"git switch --orphan removes tracked files, including .claude/settings.json; use 'git worktree add <dir> <branch>' instead.",
			)
		if (target && git('rev-parse', '--verify', '--quiet', `${target}^{commit}`) === 0) {
			if (git('diff', '--quiet', 'HEAD', target, '--', '.claude/settings.json') === 1) {
				deny(
					`${target} has a different .claude/settings.json; use 'git worktree add <dir> ${target}' instead of switching this checkout.`,
				)
			}
		}
	}
}

process.exit(0)
