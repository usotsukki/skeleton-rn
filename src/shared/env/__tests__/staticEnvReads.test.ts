import fs from 'fs'
import path from 'path'
import { clientEnvSchema } from '../clientEnvSchema'

// Release bundles only contain env values read as `process.env.EXPO_PUBLIC_X`; a schema key without
// that static read parses as undefined in production (dev hides it via a runtime polyfill).
describe('client env static reads', () => {
	const source = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8')

	it.each(Object.keys(clientEnvSchema.shape))('reads %s statically', key => {
		expect(source).toContain(`process.env.${key}`)
	})

	it('never passes process.env as a whole object', () => {
		expect(source).not.toMatch(/parse\(process\.env\)/)
	})
})
