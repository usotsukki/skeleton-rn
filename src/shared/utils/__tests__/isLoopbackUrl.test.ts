import { isLoopbackUrl, toAndroidEmulatorHostUrl } from '../isLoopbackUrl'

describe('isLoopbackUrl', () => {
	it.each(['http://127.0.0.1:54321', 'http://localhost:54321', 'http://[::1]:54321'])('accepts %s', url => {
		expect(isLoopbackUrl(url)).toBe(true)
	})

	// 10.0.2.2 is the host only from inside an Android emulator; elsewhere it is another machine.
	it.each([
		'https://abc.supabase.co',
		'http://10.0.2.2:54321',
		'http://192.168.1.10:54321',
		'http://127.0.0.1.evil.com',
	])('rejects %s', url => {
		expect(isLoopbackUrl(url)).toBe(false)
	})

	it.each([undefined, '', 'not a url'])('rejects %p', url => {
		expect(isLoopbackUrl(url)).toBe(false)
	})
})

describe('toAndroidEmulatorHostUrl', () => {
	it.each([
		['http://127.0.0.1:54321', 'http://10.0.2.2:54321'],
		['http://localhost:54321', 'http://10.0.2.2:54321'],
	])('maps %s to %s', (url, expected) => {
		expect(toAndroidEmulatorHostUrl(url)).toBe(expected)
	})

	it.each(['https://abc.supabase.co', undefined])('leaves %p alone', url => {
		expect(toAndroidEmulatorHostUrl(url)).toBe(url)
	})
})
