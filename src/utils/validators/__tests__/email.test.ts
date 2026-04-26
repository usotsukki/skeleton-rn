import { emailSchema, isValidEmail } from '../email'

describe('emailSchema', () => {
	describe('valid addresses', () => {
		it.each([
			['user@example.com'],
			['user.name+label@domain.co'],
			['user123@sub.domain.com'],
			['  trimmed@example.com  '],
		])('accepts %s', input => {
			expect(emailSchema.safeParse(input).success).toBe(true)
		})

		it('trims whitespace before validating', () => {
			const parsed = emailSchema.parse('  user@example.com  ')
			expect(parsed).toBe('user@example.com')
		})
	})

	describe('invalid addresses', () => {
		it.each([
			['', 'error.required'],
			['invalid-email', 'error.wrongEmailFormat'],
			['invalid@domain', 'error.wrongEmailFormat'],
			['user@domain,com', 'error.wrongEmailFormat'],
			['@missinglocalpart.com', 'error.wrongEmailFormat'],
			['missingdomain@.com', 'error.wrongEmailFormat'],
		])('rejects %s with %s', (input, expectedKey) => {
			const result = emailSchema.safeParse(input)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe(expectedKey)
			}
		})
	})
})

describe('isValidEmail', () => {
	it('returns true for valid', () => {
		expect(isValidEmail('a@b.co')).toBe(true)
	})

	it('returns false for invalid', () => {
		expect(isValidEmail('nope')).toBe(false)
	})
})
