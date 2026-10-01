import fs from 'node:fs'
import appConfig from '../../app.config'
import { hasAndroidMapsKey } from '../androidMapsConfig'

function manifestWithKey(value: string) {
	return `<manifest><application><meta-data android:name="com.google.android.geo.API_KEY" android:value="${value}" /></application></manifest>`
}

describe('embedded Android Maps availability', () => {
	it('stays unavailable after adding an env key until prebuild installs it', () => {
		jest.spyOn(fs, 'readFileSync').mockReturnValue('<manifest><application /></manifest>')
		const previous = process.env.GOOGLE_MAPS_API_KEY_ANDROID
		process.env.GOOGLE_MAPS_API_KEY_ANDROID = 'new-key-not-yet-prebuilt'
		try {
			expect(hasAndroidMapsKey('/app')).toBe(false)
			const config = appConfig({
				projectRoot: '/app',
				staticConfigPath: null,
				packageJsonPath: null,
				config: { name: 'Demo', slug: 'demo', ios: { bundleIdentifier: 'com.acme.demo' } },
			})
			expect(config.extra?.androidMapsConfigured).toBe(false)
		} finally {
			if (previous === undefined) delete process.env.GOOGLE_MAPS_API_KEY_ANDROID
			else process.env.GOOGLE_MAPS_API_KEY_ANDROID = previous
		}
	})

	it('uses the native key even if the environment no longer contains it', () => {
		jest.spyOn(fs, 'readFileSync').mockReturnValue(manifestWithKey('installed-key'))
		expect(hasAndroidMapsKey('/app')).toBe(true)
	})

	it.each(['', '   ', '@string/maps_key', '${mapsKey}'])('fails closed for an empty or unresolved key: %s', value => {
		jest.spyOn(fs, 'readFileSync').mockReturnValue(manifestWithKey(value))
		expect(hasAndroidMapsKey('/app')).toBe(false)
	})

	it('ignores commented-out keys', () => {
		jest
			.spyOn(fs, 'readFileSync')
			.mockReturnValue(`<manifest><application><!-- ${manifestWithKey('old-key')} --></application></manifest>`)
		expect(hasAndroidMapsKey('/app')).toBe(false)
	})

	it('accepts reordered attributes and single quotes in generated metadata', () => {
		jest
			.spyOn(fs, 'readFileSync')
			.mockReturnValue(
				"<manifest><application><meta-data android:value='installed-key' android:name='com.google.android.geo.API_KEY' /></application></manifest>",
			)
		expect(hasAndroidMapsKey('/app')).toBe(true)
	})

	it('fails closed before the first prebuild creates the manifest', () => {
		jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
			throw Object.assign(new Error('not generated'), { code: 'ENOENT' })
		})
		expect(hasAndroidMapsKey('/app')).toBe(false)
	})

	it('reports unexpected filesystem errors instead of hiding them', () => {
		jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
			throw Object.assign(new Error('permission denied'), { code: 'EACCES' })
		})
		expect(() => hasAndroidMapsKey('/app')).toThrow('permission denied')
	})
})
