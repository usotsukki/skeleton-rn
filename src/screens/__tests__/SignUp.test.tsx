import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'
import SignUp from '../SignUp'

const mockCreateUser = jest.fn()

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
		signIn: jest.fn(),
		signInWithGoogle: jest.fn(),
		signInWithApple: jest.fn(),
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
const SUBMIT_LABEL = 'signUp'

describe('SignUp screen', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders email + password fields + submit', () => {
		render(<SignUp />)
		expect(screen.getByLabelText(EMAIL_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(PASSWORD_LABEL)).toBeTruthy()
		expect(screen.getByLabelText(SUBMIT_LABEL)).toBeTruthy()
	})

	it('disables submit when fields empty', () => {
		render(<SignUp />)
		expect(screen.getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled).toBe(true)
	})

	it('does not call createUser when fields empty', () => {
		render(<SignUp />)
		fireEvent.press(screen.getByLabelText(SUBMIT_LABEL))
		expect(mockCreateUser).not.toHaveBeenCalled()
	})
})
