import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'
import SignIn from '../SignIn'

const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()
const mockSignInWithApple = jest.fn()

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
		signIn: mockSignIn,
		signInWithGoogle: mockSignInWithGoogle,
		signInWithApple: mockSignInWithApple,
		createUser: jest.fn(),
		signOut: jest.fn(),
		signOutAsync: jest.fn(),
		sendPasswordResetEmail: jest.fn(),
		sendPasswordResetEmailAsync: jest.fn(),
		updatePassword: jest.fn(),
		updatePasswordAsync: jest.fn(),
		loading: false,
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
	})

	it('renders email + password fields + submit button', () => {
		render(<SignIn />)
		expect(screen.getByLabelText(EMAIL_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(PASSWORD_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(SUBMIT_LABEL)).toBeTruthy()
	})

	it('disables submit when fields empty', () => {
		render(<SignIn />)
		expect(screen.getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled).toBe(true)
	})

	it('does not call signIn when fields empty', () => {
		render(<SignIn />)
		fireEvent.press(screen.getByLabelText(SUBMIT_LABEL))
		expect(mockSignIn).not.toHaveBeenCalled()
	})
})
