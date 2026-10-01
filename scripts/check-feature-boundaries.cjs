#!/usr/bin/env node
/**
 * Feature-split architecture checker (`yarn lint:architecture`). Layout: docs/source-architecture.md.
 *
 * - src/shared/** may not import @app/features/* or @app/app-shell/*.
 * - src/features/<a>/** may not import @app/app-shell/*, nor deep-import @app/features/<b>/* outside the
 *   approved sub-paths (barrels always allowed).
 * - src/app/** and src/app-shell/** import features through their barrels only.
 * - Pre-split paths (@app/api, @app/components, @app/hooks, …) are denied.
 * Test files (`__tests__`, `*.test.*`) are skipped: they mock the defining module directly.
 */
const { readdirSync, readFileSync } = require('node:fs')
const { dirname, join, relative, resolve } = require('node:path')

const REPO_ROOT = resolve(__dirname, '..')
const SRC = join(REPO_ROOT, 'src')

// `from '…'` (incl. multiline import lists), side-effect `import '…'`, `require('…')`, `import('…')`.
const IMPORT_RE =
	/\bfrom\s*['"]([^'"\n]+)['"]|^\s*import\s*['"]([^'"\n]+)['"]|\b(?:require|import)\(\s*['"]([^'"\n]+)['"]\s*\)/gm

const DENIED_PREFIX = /^@app\/(api|components|hooks|screens|store|storage|theme|utils|env|translations|metro)(\/|$)/

// Cross-feature deep imports allowed without going through the barrel.
const APPROVED_CROSS_FEATURE_SUBPATHS = [
	/^\/api(?:\/|$)/,
	/^\/hooks\//,
	/^\/components\//,
	/^\/types$/,
	/^\/utils(?:\/|$)/,
]

function walk(dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) walk(full, out)
		else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full)
	}
	return out
}

const isTestFile = path => /(__tests__|\.test\.|\.spec\.)/.test(path)

function contextOf(file) {
	const rel = relative(SRC, file).replaceAll('\\', '/')
	if (rel.startsWith('shared/')) return { kind: 'shared' }
	if (rel.startsWith('app-shell/')) return { kind: 'app-shell' }
	if (rel.startsWith('app/')) return { kind: 'app' }
	const m = rel.match(/^features\/([^/]+)\//)
	if (m) return { kind: 'feature', feature: m[1] }
	return { kind: 'other' }
}

function check(file) {
	if (isTestFile(file)) return []
	const src = readFileSync(file, 'utf8')
	const ctx = contextOf(file)
	const violations = []
	const add = (importPath, rule) => violations.push({ file, importPath, rule })

	for (const m of src.matchAll(IMPORT_RE)) {
		const spec = m[1] ?? m[2] ?? m[3]
		// Relative imports are checked by where they land (e.g. shared reaching into a feature via ../../).
		const landed = spec.startsWith('.') ? relative(SRC, resolve(dirname(file), spec)).replaceAll('\\', '/') : null
		const importPath = landed && !landed.startsWith('..') ? `@app/${landed}` : spec
		if (!importPath.startsWith('@app/')) continue

		if (DENIED_PREFIX.test(importPath)) {
			add(importPath, 'pre-split path; import from @app/shared/*, @app/app-shell/* or @app/features/<x>')
			continue
		}

		const feat = importPath.match(/^@app\/features\/([^/]+)(\/.+)?$/)
		const toShell = importPath.startsWith('@app/app-shell')

		if (ctx.kind === 'shared' && (feat || toShell)) {
			add(importPath, 'shared cannot import features or app-shell')
			continue
		}
		if (ctx.kind === 'feature') {
			if (toShell) add(importPath, 'features cannot import app-shell')
			else if (feat && feat[1] !== ctx.feature && feat[2]) {
				if (!APPROVED_CROSS_FEATURE_SUBPATHS.some(re => re.test(feat[2])))
					add(
						importPath,
						`feature "${ctx.feature}" cannot deep-import feature "${feat[1]}"; use @app/features/${feat[1]}`,
					)
			} else if (feat && feat[1] === ctx.feature && !spec.startsWith('.'))
				add(importPath, 'import private files of the same feature relatively')
		}
		if ((ctx.kind === 'app' || ctx.kind === 'app-shell') && feat && feat[2]) {
			add(importPath, `${ctx.kind} can only import feature barrels (@app/features/<x>)`)
		}
	}
	return violations
}

const files = walk(SRC)
const violations = files.flatMap(check)

if (violations.length === 0) {
	console.log(`✓ Feature boundary check passed (${files.length} files scanned).`)
	process.exit(0)
}

console.error(`✗ Feature boundary check found ${violations.length} violation(s):\n`)
const grouped = Map.groupBy(violations, v => v.rule)
for (const [rule, list] of grouped) {
	console.error(`  Rule: ${rule}`)
	for (const v of list) console.error(`    ${relative(REPO_ROOT, v.file)}: imports "${v.importPath}"`)
	console.error('')
}
process.exit(1)
