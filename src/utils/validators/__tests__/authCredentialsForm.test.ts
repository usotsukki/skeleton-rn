import { authCredentialsSchema, resetPasswordSchema } from '../authCredentialsForm'

describe('authCredentialsSchema', () => {
	it('rejects empty / invalid input with i18n key messages', () => {
		const empty = authCredentialsSchema.safeParse({ email: '', password: '' })
		expect(empty.success).toBe(false)

		const short = authCredentialsSchema.safeParse({ email: 'a@b.co', password: '12345' })
		expect(short.success).toBe(false)
	})

	it('accepts valid credentials', () => {
		const r = authCredentialsSchema.safeParse({ email: 'a@b.co', password: '123456' })
		expect(r.success).toBe(true)
		if (r.success) {
			expect(r.data.email).toBe('a@b.co')
			expect(r.data.password).toBe('123456')
		}
	})
})

describe('resetPasswordSchema', () => {
	const confirmErrors = (password: string, confirm: string) =>
		resetPasswordSchema
			.safeParse({ password, confirm })
			.error?.issues.filter(i => i.path[0] === 'confirm')
			.map(i => i.message)

	it('accepts matching passwords', () => {
		expect(resetPasswordSchema.safeParse({ password: '123456', confirm: '123456' }).success).toBe(true)
	})

	it('requires the confirmation', () => {
		expect(confirmErrors('123456', '')).toEqual(['error.required'])
	})

	it('reports a mismatch even while the password is too short', () => {
		expect(confirmErrors('123', '1234')).toEqual(['error.passwordsDoNotMatch'])
	})
})
