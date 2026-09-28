import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import ForgotPassword from '../ForgotPassword'
import ResetPassword from '../ResetPassword'

const mockSendPasswordResetEmailAsync = jest.fn()
const mockUpdatePasswordAsync = jest.fn()

// The auth facade loads the Supabase client and native sign-in modules; the form only needs the pure mapper.
jest.mock('@app/api/auth', () => ({
	getAuthFormError: jest.requireActual('@app/api/auth/authErrorMessages').getAuthFormError,
}))

jest.mock('@app/hooks/useAuth', () => {
	const mockStore = { setPasswordRecoveryUserId: jest.fn() }
	return {
		__esModule: true,
		default: () => ({
			sendPasswordResetEmailAsync: mockSendPasswordResetEmailAsync,
			updatePasswordAsync: mockUpdatePasswordAsync,
			loading: false,
		}),
		useAuthStore: <T,>(selector: (s: typeof mockStore) => T) => selector(mockStore),
	}
})

const EMAIL_LABEL = 'modules.auth.email'
const PASSWORD_LABEL = 'modules.auth.password'
const CONFIRM_LABEL = 'modules.auth.confirmPassword'

describe('ForgotPassword', () => {
	beforeEach(() => jest.clearAllMocks())

	it('allows an empty submit and says the email is required', async () => {
		await render(<ForgotPassword />)
		await fireEvent.press(screen.getByTestId('forgot-submit'))
		expect(await screen.findByText('error.required')).toBeTruthy()
		expect(mockSendPasswordResetEmailAsync).not.toHaveBeenCalled()
	})

	it("sends the trimmed email from the keyboard's send key", async () => {
		mockSendPasswordResetEmailAsync.mockResolvedValue(undefined)
		await render(<ForgotPassword />)
		await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), ' user@example.com ')
		await fireEvent(screen.getByLabelText(EMAIL_LABEL), 'submitEditing')
		await waitFor(() => expect(mockSendPasswordResetEmailAsync).toHaveBeenCalledWith({ email: 'user@example.com' }))
	})
})

it('ForgotPassword shows a rate limit above the button and stays on the screen', async () => {
	mockSendPasswordResetEmailAsync.mockRejectedValue(
		Object.assign(new Error('For security purposes, you can only request this after 30 seconds.'), {
			code: 'over_email_send_rate_limit',
		}),
	)
	await render(<ForgotPassword />)
	await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), 'user@example.com')
	await fireEvent.press(screen.getByTestId('forgot-submit'))
	expect(await screen.findByText('error.emailRateLimit')).toBeTruthy()
})

describe('ResetPassword', () => {
	beforeEach(() => jest.clearAllMocks())

	it('flags a mismatched confirmation once it is left, without updating', async () => {
		await render(<ResetPassword />)
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')
		await fireEvent.changeText(screen.getByLabelText(CONFIRM_LABEL), 'secret12')
		expect(screen.queryByText('error.passwordsDoNotMatch')).toBeNull()

		await fireEvent(screen.getByLabelText(CONFIRM_LABEL), 'blur')
		expect(await screen.findByText('error.passwordsDoNotMatch')).toBeTruthy()

		await fireEvent(screen.getByLabelText(CONFIRM_LABEL), 'submitEditing')
		expect(mockUpdatePasswordAsync).not.toHaveBeenCalled()
	})

	it('puts a rejected new password under the password field', async () => {
		mockUpdatePasswordAsync.mockRejectedValue(
			Object.assign(new Error('New password should be different from the old password.'), { code: 'same_password' }),
		)
		await render(<ResetPassword />)
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')
		await fireEvent.changeText(screen.getByLabelText(CONFIRM_LABEL), 'secret123')
		await fireEvent.press(screen.getByTestId('reset-submit'))
		expect(await screen.findByText('error.samePassword')).toBeTruthy()
		expect(screen.queryByTestId('form-error')).toBeNull()
	})

	it('updates the password when both entries match', async () => {
		mockUpdatePasswordAsync.mockResolvedValue(undefined)
		await render(<ResetPassword />)
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')
		await fireEvent.changeText(screen.getByLabelText(CONFIRM_LABEL), 'secret123')
		await fireEvent.press(screen.getByTestId('reset-submit'))
		await waitFor(() => expect(mockUpdatePasswordAsync).toHaveBeenCalledWith({ password: 'secret123' }))
	})
})
