import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import useToast from '@app/hooks/useToast'
import SignIn from '../SignIn'

const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()
const mockSignInWithApple = jest.fn()

const mockAuthState = {
	loading: false,
	pending: { credentials: false, google: false, apple: false, oauth: undefined as 'google' | 'apple' | undefined },
}

// The auth facade loads the Supabase client and native sign-in modules; the form only needs the pure mapper.
jest.mock('@app/api/auth', () => ({
	getAuthFormError: jest.requireActual('@app/api/auth/authErrorMessages').getAuthFormError,
}))

jest.mock('@app/hooks/useAuth', () => {
	const mockStore = {
		staySignedIn: true,
		setStaySignedIn: jest.fn(),
		user: null,
		setUser: jest.fn(),
		passwordRecoveryUserId: null,
		setPasswordRecoveryUserId: jest.fn(),
		pendingPostAuthRoute: null,
		setPendingPostAuthRoute: jest.fn(),
	}
	const mockUseAuthStore = Object.assign(
		jest.fn(<T,>(selector: (s: typeof mockStore) => T) => selector(mockStore)),
		{ getState: () => mockStore, setState: jest.fn() },
	)
	const mockUseAuth = () => ({
		signInAsync: mockSignIn,
		signInWithGoogle: mockSignInWithGoogle,
		signInWithApple: mockSignInWithApple,
		createUser: jest.fn(),
		signOut: jest.fn(),
		signOutAsync: jest.fn(),
		sendPasswordResetEmail: jest.fn(),
		sendPasswordResetEmailAsync: jest.fn(),
		updatePassword: jest.fn(),
		updatePasswordAsync: jest.fn(),
		loading: mockAuthState.loading,
		pending: mockAuthState.pending,
	})
	return {
		__esModule: true,
		default: mockUseAuth,
		useAuthStore: mockUseAuthStore,
		useAuthListener: jest.fn(),
		useCurrentUid: jest.fn(),
	}
})

const EMAIL_LABEL = 'modules.auth.email'
const PASSWORD_LABEL = 'modules.auth.password'
const SUBMIT_LABEL = 'signIn'

describe('SignIn screen', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockAuthState.loading = false
		mockAuthState.pending = { credentials: false, google: false, apple: false, oauth: undefined }
	})

	it('renders email + password fields + submit button', async () => {
		await render(<SignIn />)
		expect(screen.getByLabelText(EMAIL_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(PASSWORD_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(SUBMIT_LABEL)).toBeTruthy()
	})

	it('labels the icon-only Apple and Google buttons for screen readers', async () => {
		await render(<SignIn />)
		expect(screen.getByLabelText('a11y.signInWithApple')).toBeTruthy()
		expect(screen.getByLabelText('a11y.signInWithGoogle')).toBeTruthy()
	})

	it('allows submitting an empty form and shows what is missing instead of signing in', async () => {
		await render(<SignIn />)
		expect(screen.getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled).toBe(false)

		await fireEvent.press(screen.getByLabelText(SUBMIT_LABEL))
		expect(await screen.findAllByText('error.required')).toHaveLength(2)
		expect(mockSignIn).not.toHaveBeenCalled()
	})

	it("signs in with the trimmed email from the password's go key", async () => {
		await render(<SignIn />)
		expect(screen.getByLabelText(EMAIL_LABEL).props.returnKeyType).toBe('next')
		await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), '  user@example.com ')
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')

		await fireEvent(screen.getByLabelText(PASSWORD_LABEL), 'submitEditing')
		await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret123' }))
	})

	async function submitCredentials() {
		await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), 'user@example.com')
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')
		await fireEvent.press(screen.getByLabelText(SUBMIT_LABEL))
	}

	it('shows wrong credentials in the form, keeps the input, and clears the message on the next edit', async () => {
		mockSignIn.mockRejectedValue(Object.assign(new Error('Invalid login credentials'), { code: 'invalid_credentials' }))
		await render(<SignIn />)
		await submitCredentials()

		expect(await screen.findByText('error.invalidEmailOrPassword')).toBeTruthy()
		expect(screen.getByTestId('form-error').props.accessibilityRole).toBe('alert')
		expect(screen.getByLabelText(EMAIL_LABEL).props.value).toBe('user@example.com')
		expect(useToast.getState().toasts).toHaveLength(0)

		// Moving between fields isn't an edit: the message stays.
		await fireEvent(screen.getByLabelText(PASSWORD_LABEL), 'blur')
		expect(screen.getByText('error.invalidEmailOrPassword')).toBeTruthy()

		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret1234')
		expect(screen.queryByText('error.invalidEmailOrPassword')).toBeNull()
	})

	it('asks an unconfirmed account to confirm the email', async () => {
		mockSignIn.mockRejectedValue(Object.assign(new Error('Email not confirmed'), { code: 'email_not_confirmed' }))
		await render(<SignIn />)
		await submitCredentials()
		expect(await screen.findByText('error.emailNotConfirmed')).toBeTruthy()
	})

	it('ignores the go key while an auth request runs', async () => {
		mockAuthState.loading = true
		mockAuthState.pending = { credentials: false, google: true, apple: false, oauth: 'google' }
		await render(<SignIn />)
		await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), 'user@example.com')
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')

		await fireEvent(screen.getByLabelText(PASSWORD_LABEL), 'submitEditing')
		expect(mockSignIn).not.toHaveBeenCalled()
	})
})
