import { readFileSync } from 'node:fs'
import path from 'node:path'
import { runInNewContext } from 'node:vm'

const SCRIPT_DIR = path.resolve(__dirname, '../../../scripts')
const SCRIPT = readFileSync(path.join(SCRIPT_DIR, 'rename.cjs'), 'utf8')

function runRename(bundleId: string) {
	const files: Record<string, string> = {
		'package.json': JSON.stringify({ name: 'template' }),
		'app.json': JSON.stringify({ expo: {} }),
		'config.toml': 'project_id = "template"\n',
	}
	const fs = {
		readFileSync: jest.fn((file: string) => files[path.basename(file)]),
		writeFileSync: jest.fn((file: string, content: string) => {
			files[path.basename(file)] = content
		}),
	}
	let exitCode = 0
	try {
		runInNewContext(SCRIPT, {
			__dirname: SCRIPT_DIR,
			require: (name: string) => (name === 'fs' ? fs : require(name)),
			console: { log: jest.fn(), error: jest.fn() },
			process: {
				argv: ['node', 'rename.cjs', 'Demo', 'demo', 'demo', bundleId],
				exit: (code: number) => {
					exitCode = code
					throw new Error('script exited')
				},
			},
		})
	} catch (error) {
		if (!(error instanceof Error) || error.message !== 'script exited') throw error
	}
	return { exitCode, fs, files }
}

describe('rename application ID validation', () => {
	it.each(['com.acme.my_app', 'com.acme.class', 'com.true.app', 'com.acme.int', 'com.acme.null'])(
		'rejects %s before reading or writing project files',
		bundleId => {
			const result = runRename(bundleId)
			expect(result.exitCode).toBe(1)
			expect(result.fs.readFileSync).not.toHaveBeenCalled()
			expect(result.fs.writeFileSync).not.toHaveBeenCalled()
		},
	)

	it('renames all identities for a valid cross-platform application ID', () => {
		const result = runRename('com.acme.myapp2')
		expect(result.exitCode).toBe(0)
		expect(JSON.parse(result.files['package.json']).name).toBe('demo')
		expect(JSON.parse(result.files['app.json']).expo).toMatchObject({
			name: 'Demo',
			slug: 'demo',
			scheme: 'demo',
			ios: { bundleIdentifier: 'com.acme.myapp2' },
			android: { package: 'com.acme.myapp2' },
		})
		expect(result.files['config.toml']).toBe('project_id = "demo"\n')
	})
})
