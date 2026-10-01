import { getAuthErrorMessage, getAuthFormError } from '../authErrorMessages'

describe('getAuthErrorMessage', () => {
	it('maps known Supabase / OAuth messages to the right i18n keys', () => {
		expect(getAuthErrorMessage(new Error('Invalid login credentials'))).toBe('error.invalidEmailOrPassword')
		expect(getAuthErrorMessage(new Error('User already registered'))).toBe('error.emailAlreadyInUse')
		expect(getAuthErrorMessage(new Error('Network request failed'))).toBe('error.networkError')
	})

	it('maps a failed or timed-out auth fetch to the network message', () => {
		const failedFetch = (message: string) =>
			Object.assign(new Error(message), { name: 'AuthRetryableFetchError', status: 0 })
		expect(getAuthErrorMessage(failedFetch('The operation was aborted.'))).toBe('error.networkError')
		expect(getAuthErrorMessage(failedFetch('REQUEST_TIMEOUT: POST /auth/v1/token exceeded 15000ms'))).toBe(
			'error.networkError',
		)
	})

	it('returns null when the user closes the Google or Apple sheet', () => {
		// Thrown by getGoogleIdToken for a `cancelled` response (providerTokens.ts).
		expect(getAuthErrorMessage(new Error('GoogleSignIn cancelled'))).toBeNull()
		// expo-apple-authentication's CodedError for a dismissed sheet.
		const appleCancel = Object.assign(new Error('The user canceled the authorization attempt'), {
			code: 'ERR_REQUEST_CANCELED',
		})
		expect(getAuthErrorMessage(appleCancel)).toBeNull()
	})

	it('maps Google Android configuration failures to a dedicated message', () => {
		const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
		expect(getAuthErrorMessage(new Error('DEVELOPER_ERROR: Follow troubleshooting instructions'))).toBe(
			'error.googleSignInMisconfigured',
		)
		expect(getAuthErrorMessage(new Error('A non-recoverable sign in failure occurred'))).toBe(
			'error.googleSignInMisconfigured',
		)
		spy.mockRestore()
	})

	it('maps Supabase rate limits by error code (the message has no "rate limit")', () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
		const rateLimited = (code: string) =>
			Object.assign(new Error('For security purposes, you can only request this after 14 seconds.'), {
				code,
				status: 429,
			})

		expect(getAuthErrorMessage(rateLimited('over_email_send_rate_limit'))).toBe('error.emailRateLimit')
		expect(getAuthErrorMessage(rateLimited('over_request_rate_limit'))).toBe('error.tooManyRequests')
		expect(spy).not.toHaveBeenCalled()
		spy.mockRestore()
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

describe('getAuthFormError', () => {
	const supabaseError = (code: string, message: string) => Object.assign(new Error(message), { code })

	it('keeps wrong credentials form-level and generic', () => {
		expect(getAuthFormError(supabaseError('invalid_credentials', 'Invalid login credentials'))).toEqual({
			key: 'error.invalidEmailOrPassword',
			field: undefined,
		})
	})

	it('tells an unconfirmed account to confirm the email instead of calling the password wrong', () => {
		expect(getAuthFormError(supabaseError('email_not_confirmed', 'Email not confirmed'))?.key).toBe(
			'error.emailNotConfirmed',
		)
	})

	it('puts input-specific errors on their field', () => {
		expect(getAuthFormError(supabaseError('user_already_exists', 'User already registered'))).toEqual({
			key: 'error.emailAlreadyInUse',
			field: 'email',
		})
		expect(getAuthFormError(supabaseError('email_address_invalid', 'Email address is invalid'))?.field).toBe('email')
		const weak = (reasons: string[]) =>
			Object.assign(supabaseError('weak_password', 'Password should be at least 8 characters.'), { reasons })
		expect(getAuthFormError(weak(['length']))).toEqual({ key: 'error.shortPassword', field: 'password' })
		expect(getAuthFormError(weak(['length', 'characters']))).toEqual({ key: 'error.weakPassword', field: 'password' })
		expect(getAuthFormError(weak(['pwned']))).toEqual({ key: 'error.weakPassword', field: 'password' })
		expect(getAuthFormError(supabaseError('same_password', 'New password should be different'))?.field).toBe('password')
	})

	it('keeps network and rate-limit errors form-level', () => {
		expect(getAuthFormError(new Error('Network request failed'))?.field).toBeUndefined()
		expect(getAuthFormError(supabaseError('over_request_rate_limit', 'For security purposes…'))?.field).toBeUndefined()
	})

	it('returns null when the user dismissed the flow', () => {
		expect(getAuthFormError(new Error('The user canceled the Google sign in.'))).toBeNull()
	})
})
