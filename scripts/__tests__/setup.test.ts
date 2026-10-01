import { execFileSync } from 'node:child_process'
import {
	chmodSync,
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(__dirname, '../..')
const { modules } = require('../setup/modules.cjs') as { modules: SetupModule[] }
const { findRegions, stripRegions, planSetup, readRemoved } = require('../setup/plan.cjs') as {
	readRemoved: (io: Io) => Set<string>
	findRegions: (text: string, file: string, ids: Set<string>) => { blocks: Block[]; errors: string[] }
	stripRegions: (text: string, blocks: Block[], ids: Set<string>) => string
	planSetup: (io: Io, options: { modules: SetupModule[]; remove: Set<string>; resetVersion?: boolean }) => Plan
}

interface SetupModule {
	id: string
	paths?: string[]
	deps?: string[]
	plugins?: string[]
	i18n?: string[][]
	env?: string[]
	knip?: string[]
}
interface Block {
	id: string
	start: number
	end: number
}
interface Io {
	read: (file: string) => string | undefined
	exists: (file: string) => boolean
	list: () => string[]
}
interface Plan {
	removedRecord: string | null
	writes: Map<string, string>
	deletes: string[]
	errors: string[]
	changes: string[]
}

const read = (file: string) => {
	const full = path.join(ROOT, file)
	return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined
}
const repo: Io = {
	read,
	exists: file => existsSync(path.join(ROOT, file)),
	list: () =>
		execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
			.split('\n')
			.filter(Boolean),
}
const json = (file: string) => JSON.parse(read(file) as string)
const LANGUAGES = ['en', 'es'].map(lang => `src/shared/translations/languages/${lang}.json`)
const ids = new Set(modules.map(m => m.id))
// Modules a previous `yarn setup` removed from this app are gone on purpose.
const present = modules.filter(m => !readRemoved(repo).has(m.id))

describe('setup manifest', () => {
	it.each(present.map(m => [m.id, m] as const).concat(present.length ? [] : [['(none left)', { id: '' }]]))(
		'%s points at things that exist',
		(_id, m) => {
			const pkg = json('package.json')
			const app = json('app.json')
			const pluginNames = app.expo.plugins.map((p: string | [string]) => (Array.isArray(p) ? p[0] : p))
			const envRules = json('env.rules.json')
			const knip = read('knip.jsonc') as string

			for (const p of m.paths ?? []) expect([p, repo.exists(p)]).toEqual([p, true])
			for (const dep of m.deps ?? []) {
				expect([dep, !!(pkg.dependencies[dep] ?? pkg.devDependencies[dep])]).toEqual([dep, true])
			}
			for (const plugin of m.plugins ?? []) expect(pluginNames).toContain(plugin)
			for (const file of LANGUAGES) {
				const strings = json(file)
				for (const keys of m.i18n ?? []) {
					const value = keys.reduce((node: Record<string, unknown> | undefined, key) => node?.[key] as never, strings)
					expect([file, keys.join('.'), value !== undefined]).toEqual([file, keys.join('.'), true])
				}
			}
			for (const key of m.env ?? []) {
				expect([key, Object.values(envRules).some(map => key in (map as object))]).toEqual([key, true])
			}
			for (const entry of m.knip ?? []) expect(knip).toContain(`"${entry}"`)
		},
	)

	it('removes no string that kept code still uses', () => {
		const plan = planSetup(repo, { modules, remove: ids })
		const deleted = (file: string) => plan.deletes.some(p => file === p || file.startsWith(`${p}/`))
		const sources = repo
			.list()
			.filter(f => /^src\/.*\.tsx?$/.test(f) && !deleted(f))
			.map(f => plan.writes.get(f) ?? (read(f) as string))
			.join('\n')
		for (const keys of present.flatMap(m => m.i18n ?? [])) {
			// Keys are referenced as 'a.b' (or a template prefix `a.b.${…}`); a top-level key alone as t('a').
			const key = keys.join('.')
			const used =
				keys.length === 1
					? sources.includes(`t('${key}')`)
					: sources.includes(`'${key}`) || sources.includes(`\`${key}.`)
			expect([key, used]).toEqual([key, false])
		}
	})

	it('finds well-formed regions for known modules only', () => {
		expect(planSetup(repo, { modules, remove: new Set() }).errors).toEqual([])
	})

	it('plans nothing when nothing is removed', () => {
		const plan = planSetup(repo, { modules, remove: new Set() })
		expect(plan.writes.size).toBe(0)
		expect(plan.deletes).toEqual([])
	})

	it.each([...ids])('removing %s alone leaves no marker of it behind', id => {
		const plan = planSetup(repo, { modules, remove: new Set([id]) })
		expect(plan.errors).toEqual([])
		for (const [file, content] of plan.writes) {
			expect([file, content.includes(`template:${id}`)]).toEqual([file, false])
		}
	})

	// A tiny app independent of this repo's state (a fork may already have removed real modules).
	const fakeApp = (files: Record<string, string>, onDisk: string[]): Io => ({
		read: file => files[file],
		exists: file => onDisk.includes(file) || file in files,
		list: () => Object.keys(files),
	})
	const fakeModules: SetupModule[] = [{ id: 'demo', paths: ['src/demo'], deps: ['demo-lib'] }]
	const appFiles = (deps: Record<string, string>, removed: string[]) => ({
		'package.json': JSON.stringify({ dependencies: deps, devDependencies: {} }),
		'app.json': JSON.stringify({ expo: { plugins: [] } }),
		'scripts/setup/removed.json': JSON.stringify(removed),
	})

	it('redoes a module that is recorded as removed but still has files (interrupted run)', () => {
		const io = fakeApp(appFiles({ 'demo-lib': '1' }, ['demo']), ['src/demo'])
		const plan = planSetup(io, { modules: fakeModules, remove: new Set(['demo']) })
		expect(plan.deletes).toEqual(['src/demo'])
		expect(plan.changes).toContain('remove demo-lib')
		expect(JSON.parse(plan.removedRecord as string)).toEqual(['demo'])
	})

	it('records a module whose files are gone but which was never recorded (run stopped before the record)', () => {
		const io = fakeApp(appFiles({}, []), [])
		const plan = planSetup(io, { modules: fakeModules, remove: new Set(['demo']) })
		expect(plan.changes).toEqual([])
		expect(JSON.parse(plan.removedRecord as string)).toEqual(['demo'])
	})

	it('skips a module that is recorded and fully gone', () => {
		const io = fakeApp(appFiles({}, ['demo']), [])
		const plan = planSetup(io, { modules: fakeModules, remove: new Set(['demo']) })
		expect(plan.changes).toEqual([])
		expect(plan.removedRecord).toBeNull()
	})

	it('rejects unknown module ids', () => {
		expect(planSetup(repo, { modules, remove: new Set(['nope']) }).errors).toEqual([
			'unknown module "nope" (yarn setup --list)',
		])
	})
})

describe('setup regions', () => {
	const known = new Set(['a', 'b'])
	const text = [
		'keep 1',
		'// #region template:a',
		'drop a',
		'// #endregion template:a',
		'keep 2',
		'{/* #region template:b */}',
		'drop b',
		'{/* #endregion template:b */}',
	].join('\n')

	it('strips only the selected modules, markers included', () => {
		const { blocks, errors } = findRegions(text, 'x.ts', known)
		expect(errors).toEqual([])
		expect(stripRegions(text, blocks, new Set(['a']))).toBe(
			['keep 1', 'keep 2', '{/* #region template:b */}', 'drop b', '{/* #endregion template:b */}'].join('\n'),
		)
	})

	it.each([
		[
			'nested',
			'// #region template:a\n// #region template:b\n// #endregion template:b\n// #endregion template:a',
			/must not nest/,
		],
		['unclosed', '// #region template:a\nx', /never closed/],
		['mismatched end', '// #region template:a\n// #endregion template:b', /without a matching region/],
		['unknown id', '// #region template:zzz\n// #endregion template:zzz', /unknown module "zzz"/],
	])('reports %s regions', (_name, input, error) => {
		expect(findRegions(input, 'x.ts', known).errors.join('\n')).toMatch(error)
	})
})

describe('setup CLI', () => {
	const run = (...args: string[]) =>
		execFileSync(process.execPath, [path.join(ROOT, 'scripts/setup.cjs'), ...args], {
			cwd: ROOT,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		})

	it('previews identity and removals without writing or renaming', () => {
		// Everything a real run would touch: the plan's writes and deletes, plus the files rename rewrites.
		const plan = planSetup(repo, { modules, remove: ids, resetVersion: true })
		const touched = [...plan.writes.keys(), 'package.json', 'app.json', 'supabase/config.toml', 'yarn.lock']
		const before = touched.map(f => [f, read(f)])

		const out = run('--identity', 'Todo', 'todo', 'todo', 'com.acme.todo', '--remove', 'all', '--dry-run')

		expect(out).toContain('rename to "Todo"')
		expect(out).toContain('Dry run: nothing was written.')
		expect(touched.map(f => [f, read(f)])).toEqual(before)
		expect(plan.deletes.filter(p => !repo.exists(p))).toEqual([])
	})

	it('ends an applied run with one full `yarn install` (a lockfile-only update leaves Yarn without binaries)', () => {
		// A tiny app with the real scripts, and `yarn` / `npx` stubs that record their arguments.
		const app = mkdtempSync(path.join(tmpdir(), 'setup-cli-'))
		try {
			for (const file of ['scripts/setup.cjs', 'scripts/rename.cjs', 'scripts/setup']) {
				cpSync(path.join(ROOT, file), path.join(app, file), { recursive: true })
			}
			mkdirSync(path.join(app, 'supabase'))
			writeFileSync(path.join(app, 'supabase/config.toml'), 'project_id = "template"\n')
			writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: 'template', dependencies: {} }))
			writeFileSync(path.join(app, 'app.json'), JSON.stringify({ expo: { version: '1.5.0', plugins: [] } }))
			const bin = path.join(app, 'bin')
			mkdirSync(bin)
			for (const tool of ['yarn', 'npx']) {
				writeFileSync(path.join(bin, tool), `#!/bin/sh\necho "${tool} $*" >> "${path.join(app, 'calls.log')}"\n`)
				chmodSync(path.join(bin, tool), 0o755)
			}
			execFileSync('git', ['init', '-q'], { cwd: app })

			execFileSync(
				process.execPath,
				[
					path.join(app, 'scripts/setup.cjs'),
					'--identity',
					'Demo',
					'demo',
					'demo',
					'com.acme.demo',
					'--yes',
					'--force',
				],
				{ cwd: app, env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` }, stdio: 'pipe' },
			)

			const yarnCalls = readFileSync(path.join(app, 'calls.log'), 'utf8')
				.split('\n')
				.filter(line => line.startsWith('yarn '))
			// rename skipped its own install under setup; setup ran exactly one, without --mode.
			expect(yarnCalls).toEqual(['yarn install'])
			expect(JSON.parse(readFileSync(path.join(app, 'app.json'), 'utf8')).expo).toMatchObject({
				name: 'Demo',
				version: '1.0.0',
			})
		} finally {
			rmSync(app, { recursive: true, force: true })
		}
	})

	it('rejects an unknown id in --keep instead of removing everything else', () => {
		expect(() => run('--keep', 'mpa', '--dry-run')).toThrow(/unknown module\(s\) in --keep: mpa/)
	})

	it('refuses to apply without a terminal or --yes', () => {
		expect(() => run('--remove', 'luxon')).toThrow(/pass --yes/)
	})
})
