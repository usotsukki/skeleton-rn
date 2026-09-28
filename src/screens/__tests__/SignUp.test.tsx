import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import useAlert from '@app/hooks/useAlert'
import useToast from '@app/hooks/useToast'
import SignUp from '../SignUp'

const mockCreateUser = jest.fn()
const mockCreateUserAsync = jest.fn()

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
		createUser: mockCreateUser,
		createUserAsync: mockCreateUserAsync,
		signInAsync: jest.fn(),
		signInWithGoogle: jest.fn(),
		signInWithApple: jest.fn(),
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
const SUBMIT_LABEL = 'signUp'

describe('SignUp screen', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockAuthState.loading = false
		mockAuthState.pending = { credentials: false, google: false, apple: false, oauth: undefined }
	})

	it('renders email + password fields + submit', async () => {
		await render(<SignUp />)
		expect(screen.getByLabelText(EMAIL_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(PASSWORD_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(SUBMIT_LABEL)).toBeTruthy()
	})

	it('allows submitting an empty form and shows what is missing instead of signing up', async () => {
		await render(<SignUp />)
		expect(screen.getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled).toBe(false)

		await fireEvent.press(screen.getByLabelText(SUBMIT_LABEL))
		expect(await screen.findAllByText('error.required')).toHaveLength(2)
		expect(mockCreateUserAsync).not.toHaveBeenCalled()
	})

	async function submitValid() {
		await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), 'new@example.com')
		await fireEvent.changeText(screen.getByLabelText(PASSWORD_LABEL), 'secret123')
		await fireEvent.press(screen.getByLabelText(SUBMIT_LABEL))
	}

	it('says to check the email when sign-up needs confirmation', async () => {
		mockCreateUserAsync.mockResolvedValue({ user: null, hasSession: false })
		await render(<SignUp />)
		await submitValid()

		await waitFor(() => expect(useAlert.getState().visible).toBe(true))
		expect(mockCreateUserAsync).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret123' })
		expect(useAlert.getState()).toMatchObject({ title: 'modules.auth.checkEmailTitle', variant: 'success' })
	})

	it('shows no alert when sign-up returns a session (the auth listener navigates)', async () => {
		mockCreateUserAsync.mockResolvedValue({ user: { uid: 'u1' }, hasSession: true })
		await render(<SignUp />)
		await submitValid()

		await waitFor(() => expect(mockCreateUserAsync).toHaveBeenCalled())
		expect(useAlert.getState().visible).toBe(false)
	})

	it('with email confirmation off (Supabase errors on a taken email), says so under the email field', async () => {
		mockCreateUserAsync.mockRejectedValue(
			Object.assign(new Error('User already registered'), { code: 'user_already_exists' }),
		)
		await render(<SignUp />)
		await submitValid()

		expect(await screen.findByText('error.emailAlreadyInUse')).toBeTruthy()
		expect(screen.queryByTestId('form-error')).toBeNull()
		expect(useAlert.getState().visible).toBe(false)
		expect(useToast.getState().toasts).toHaveLength(0)

		await fireEvent.changeText(screen.getByLabelText(EMAIL_LABEL), 'other@example.com')
		expect(screen.queryByText('error.emailAlreadyInUse')).toBeNull()
	})

	it('shows a failed request above the submit button instead of the confirmation alert', async () => {
		mockCreateUserAsync.mockRejectedValue(new Error('Network request failed'))
		await render(<SignUp />)
		await submitValid()

		expect(await screen.findByText('error.networkError')).toBeTruthy()
		expect(useAlert.getState().visible).toBe(false)
	})

	it('shows a spinner on submit while the request runs', async () => {
		mockAuthState.loading = true
		mockAuthState.pending = { credentials: true, google: false, apple: false, oauth: undefined }
		await render(<SignUp />)
		expect(screen.getByLabelText(SUBMIT_LABEL).props.accessibilityState).toMatchObject({ busy: true, disabled: true })
	})

	it('spins the tapped provider and disables the rest during an OAuth request', async () => {
		mockAuthState.loading = true
		mockAuthState.pending = { credentials: false, google: true, apple: false, oauth: 'google' }
		await render(<SignUp />)
		expect(screen.getByLabelText('a11y.signInWithGoogle').props.accessibilityState).toMatchObject({ busy: true })
		expect(screen.getByLabelText('a11y.signInWithApple').props.accessibilityState).toMatchObject({
			disabled: true,
			busy: false,
		})
		expect(screen.getByLabelText(SUBMIT_LABEL).props.accessibilityState).toMatchObject({ disabled: true, busy: false })
	})
})
