// Pure planning for `yarn setup`: reads files through `io`, returns every write and delete without
// touching the disk, so a bad marker or file aborts before anything changes.
const MARKER = /#(end)?region template:([a-z0-9-]+)/
const TEXT_FILE = /\.(c|m)?(j|t)sx?$|\.jsonc?$|\.md$|\.ya?ml$|\.toml$/
/** Files that talk about markers rather than contain them. */
const SKIP = [/^scripts\/setup(\/|\.cjs$)/, /^scripts\/__tests__\/setup/]
const LANGUAGES_DIR = 'src/shared/translations/languages'

/** Region blocks in one file; nested, unmatched or unknown regions are errors. */
function findRegions(text, file, knownIds) {
	const blocks = []
	const errors = []
	let open = null
	text.split('\n').forEach((line, index) => {
		const match = MARKER.exec(line)
		if (!match) return
		const [, end, id] = match
		const where = `${file}:${index + 1}`
		if (!knownIds.has(id)) errors.push(`${where}: unknown module "${id}"`)
		if (!end) {
			if (open) errors.push(`${where}: region "${id}" opens inside "${open.id}" (regions must not nest)`)
			else open = { id, start: index }
		} else if (!open || open.id !== id) {
			errors.push(`${where}: "#endregion template:${id}" without a matching region`)
		} else {
			blocks.push({ id, start: open.start, end: index })
			open = null
		}
	})
	if (open) errors.push(`${file}:${open.start + 1}: region "${open.id}" is never closed`)
	return { blocks, errors }
}

/** Deletes the marked blocks (markers included) of the given modules. */
function stripRegions(text, blocks, ids) {
	const drop = new Set()
	for (const block of blocks) {
		if (!ids.has(block.id)) continue
		for (let line = block.start; line <= block.end; line++) drop.add(line)
	}
	return text
		.split('\n')
		.filter((_, index) => !drop.has(index))
		.join('\n')
}

const json = text => JSON.parse(text)
const stringify = value => `${JSON.stringify(value, null, '\t')}\n`

function deletePath(object, keys) {
	const parent = keys
		.slice(0, -1)
		.reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), object)
	const last = keys[keys.length - 1]
	if (!parent || typeof parent !== 'object' || !(last in parent)) return false
	delete parent[last]
	return true
}

const pluginName = plugin => (Array.isArray(plugin) ? plugin[0] : plugin)

/** Modules a previous `yarn setup` removed (kept in git so reruns and the manifest test skip them). */
const REMOVED_FILE = 'scripts/setup/removed.json'

function readRemoved(io) {
	const text = io.read(REMOVED_FILE)
	return new Set(text ? JSON.parse(text) : [])
}

/**
 * @param {{ read: (file: string) => string | undefined, exists: (file: string) => boolean, list: () => string[] }} io
 * @param {{ modules: object[], remove: Set<string>, resetVersion?: boolean }} options
 */
function planSetup(io, { modules, remove: requested, resetVersion = false }) {
	const knownIds = new Set(modules.map(m => m.id))
	const writes = new Map()
	const deletes = []
	const errors = []
	const changes = []
	const read = file => (writes.has(file) ? writes.get(file) : io.read(file))

	for (const id of requested) if (!knownIds.has(id)) errors.push(`unknown module "${id}" (yarn setup --list)`)

	// Regions are checked in every file, also for modules that stay, so a broken marker is caught early.
	const marked = []
	for (const file of io.list()) {
		if (!TEXT_FILE.test(file) || SKIP.some(re => re.test(file))) continue
		const text = io.read(file)
		if (text === undefined || !text.includes('region template:')) continue
		const { blocks, errors: fileErrors } = findRegions(text, file, knownIds)
		errors.push(...fileErrors)
		if (fileErrors.length === 0) marked.push({ file, text, blocks })
	}

	// A module recorded as removed whose files or markers are still there was interrupted: redo it.
	const markedIds = new Set(marked.flatMap(f => f.blocks.map(b => b.id)))
	const leftover = m => markedIds.has(m.id) || (m.paths ?? []).some(p => io.exists(p))
	const alreadyRemoved = new Set(modules.filter(m => readRemoved(io).has(m.id) && !leftover(m)).map(m => m.id))
	const remove = new Set([...requested].filter(id => !alreadyRemoved.has(id)))
	const selected = modules.filter(m => remove.has(m.id))

	for (const { file, text, blocks } of marked) {
		if (blocks.some(b => remove.has(b.id))) {
			writes.set(file, stripRegions(text, blocks, remove))
			changes.push(`edit ${file}`)
		}
	}

	for (const m of selected) {
		for (const p of m.paths ?? []) {
			if (io.exists(p)) {
				deletes.push(p)
				changes.push(`delete ${p}`)
			}
		}
	}

	const removedDeps = []
	const pkg = json(read('package.json'))
	for (const dep of selected.flatMap(m => m.deps ?? [])) {
		for (const field of ['dependencies', 'devDependencies']) {
			if (pkg[field]?.[dep]) {
				delete pkg[field][dep]
				removedDeps.push(dep)
				changes.push(`remove ${dep}`)
			}
		}
	}
	if (removedDeps.length) writes.set('package.json', stringify(pkg))

	const app = json(read('app.json'))
	const plugins = new Set(selected.flatMap(m => m.plugins ?? []))
	const keptPlugins = (app.expo.plugins ?? []).filter(p => !plugins.has(pluginName(p)))
	const appChanged = keptPlugins.length !== (app.expo.plugins ?? []).length
	if (appChanged) {
		changes.push(`remove app.json plugins: ${[...plugins].join(', ')}`)
		app.expo.plugins = keptPlugins
	}
	if (resetVersion && app.expo.version !== '1.0.0') {
		app.expo.version = '1.0.0'
		changes.push('app.json version → 1.0.0')
	}
	if (appChanged || resetVersion) writes.set('app.json', stringify(app))

	const i18nPaths = selected.flatMap(m => m.i18n ?? [])
	if (i18nPaths.length) {
		for (const file of io.list().filter(f => f.startsWith(`${LANGUAGES_DIR}/`) && f.endsWith('.json'))) {
			const strings = json(read(file))
			const removed = i18nPaths.filter(keys => deletePath(strings, keys))
			if (removed.length) {
				writes.set(file, stringify(strings))
				changes.push(`remove ${removed.length} strings from ${file}`)
			}
		}
	}

	const envKeys = selected.flatMap(m => m.env ?? [])
	if (envKeys.length) {
		const rules = json(read('env.rules.json'))
		const removed = envKeys.filter(key => Object.values(rules).some(map => deletePath(map, [key])))
		if (removed.length) {
			writes.set('env.rules.json', stringify(rules))
			changes.push(`remove env rules: ${removed.join(', ')}`)
		}
	}

	const knipEntries = new Set(selected.flatMap(m => m.knip ?? []))
	if (knipEntries.size) {
		const knip = read('knip.jsonc')
		const kept = knip.split('\n').filter(line => {
			const entry = /^\s*"([^"]+)",?\s*$/.exec(line)
			return !(entry && knipEntries.has(entry[1]))
		})
		if (kept.length !== knip.split('\n').length) {
			writes.set('knip.jsonc', kept.join('\n'))
			changes.push('update knip.jsonc')
		}
	}

	if (selected.some(m => m.readme)) {
		writes.set('readme.md', appReadme(json(read('app.json')).expo.name))
		changes.push('replace readme.md')
	}

	return {
		writes,
		deletes,
		errors,
		changes,
		// Written by the caller after every write and delete succeeded, so an interrupted run is redone.
		removedRecord: selected.length ? stringify([...alreadyRemoved, ...selected.map(m => m.id)].sort()) : null,
		nativeChanged: selected.some(m => m.native),
	}
}

function appReadme(name) {
	return `# ${name}

Expo / React Native app (Expo Router, NativeWind, Supabase).

## Start

\`\`\`bash
yarn
cp .env.example .env
yarn dev ios
\`\`\`

\`yarn dev\` starts the local backend (Docker) and Metro, then builds and opens the app. \`yarn dev:stop\` stops both.

## Docs

- [Environment and backend](docs/environment.md)
- [Source layout](docs/source-architecture.md)
- [Release and fork checklist](docs/new-app.md)
- Agent rules: [CLAUDE.md](CLAUDE.md), [AGENTS.md](AGENTS.md)

## Checks

\`yarn check\` runs lint (types, eslint, prettier, unused code, feature boundaries) and the tests.
`
}

module.exports = { findRegions, stripRegions, planSetup, appReadme, readRemoved, REMOVED_FILE }
