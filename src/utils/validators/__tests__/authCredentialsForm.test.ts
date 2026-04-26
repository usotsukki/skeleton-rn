import { authCredentialsSchema } from '../authCredentialsForm'

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
