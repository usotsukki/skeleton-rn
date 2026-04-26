import { getAuthErrorMessage } from '../authErrorMessages'

describe('getAuthErrorMessage', () => {
	it('maps known Supabase / OAuth messages to the right i18n keys', () => {
		expect(getAuthErrorMessage(new Error('Invalid login credentials'))).toBe('error.invalidEmailOrPassword')
		expect(getAuthErrorMessage(new Error('User already registered'))).toBe('error.emailAlreadyInUse')
		expect(getAuthErrorMessage(new Error('Network request failed'))).toBe('error.networkError')
	})

	it('returns null for Google user-cancel flows', () => {
		expect(getAuthErrorMessage(new Error('The user canceled the Google sign in. Please try again.'))).toBeNull()
	})

	it('uses generic i18n key for unmapped errors; logs details in __DEV__', () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

		expect(getAuthErrorMessage(new Error('completely unknown xyzzy'))).toBe('error.genericAuth')

		if (__DEV__) {
			expect(spy).toHaveBeenCalledWith(
				'[getAuthErrorMessage] unmapped error',
				expect.objectContaining({ message: 'completely unknown xyzzy' }),
			)
		}

		spy.mockRestore()
	})
})
