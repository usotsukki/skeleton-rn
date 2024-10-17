import validateEmail from '../validators/validateEmail'

describe('validateEmail', () => {
	it('should return true for a valid email', () => {
		expect(validateEmail('test@example.com')).toBe(true)
		expect(validateEmail('user.name+label@domain.co')).toBe(true)
		expect(validateEmail('user123@sub.domain.com')).toBe(true)
	})

	it('should return false for an invalid email', () => {
		expect(validateEmail('invalid-email')).toBe(false)
		expect(validateEmail('invalid@domain')).toBe(false)
		expect(validateEmail('user@domain,com')).toBe(false)
		expect(validateEmail('@missinglocalpart.com')).toBe(false)
		expect(validateEmail('missingdomain@.com')).toBe(false)
		expect(validateEmail('missing@tld.')).toBe(false)
	})

	it('should return false for an empty string', () => {
		expect(validateEmail('')).toBe(false)
	})

	it('should handle edge cases', () => {
		expect(validateEmail('user@domain.longtld')).toBe(true) // very long TLDs
		expect(validateEmail('a@b.c')).toBe(false) // very short domain
		expect(validateEmail('user@domain..com')).toBe(false) // double dot in domain
		expect(validateEmail('user@-domain.com')).toBe(false) // domain starts with a hyphen
	})
})
