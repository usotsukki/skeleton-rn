import { isValidPassword, passwordSchema } from '../password'

describe('passwordSchema', () => {
	it('accepts a 6+ char password', () => {
		expect(passwordSchema.safeParse('secret1').success).toBe(true)
	})

	it('rejects shorter than 6 chars with error.shortPassword', () => {
		const result = passwordSchema.safeParse('short')
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe('error.shortPassword')
		}
	})
})

describe('isValidPassword', () => {
	it('returns true for valid', () => {
		expect(isValidPassword('123456')).toBe(true)
	})

	it('returns false for invalid', () => {
		expect(isValidPassword('12345')).toBe(false)
	})
})
