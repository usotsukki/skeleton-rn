import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { posthog } from '@app/api/analytics'
import { createTestQueryClient } from '@app/utils/test-utils/queryClient'
import useAuth from '../useAuth'

const mockSignIn = jest.fn()
const mockCreateUser = jest.fn()
const mockGoogle = jest.fn()

jest.mock('@app/api/auth', () => ({
	signIn: (...args: unknown[]) => mockSignIn(...args),
	createUser: (...args: unknown[]) => mockCreateUser(...args),
	signInWithGoogle: () => mockGoogle(),
	signInWithApple: jest.fn(),
	signOut: jest.fn(),
	sendPasswordResetEmail: jest.fn(),
	updatePassword: jest.fn(),
	getAuthErrorMessage: () => null,
	subscribeToAuthChanges: jest.fn(),
}))

async function renderAuth() {
	const client = createTestQueryClient()
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	)
	return renderHook(() => useAuth(), { wrapper })
}

const creds = { email: 'a@b.co', password: 'secret1' }

// TanStack notifies React of each mutation state change on a 0 ms timer, after the promise act() awaited
// (and mutate() returns none): wait for those renders inside act.
const flushNotifications = () =>
	new Promise(resolve => {
		setTimeout(resolve, 10)
	})

describe('useAuth analytics events', () => {
	it('tracks an email sign-in only when it succeeds', async () => {
		mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials')).mockResolvedValueOnce(undefined)
		const { result } = await renderAuth()

		await act(async () => {
			await result.current.signInAsync(creds).catch(() => undefined)
			await flushNotifications()
		})
		expect(posthog.capture).not.toHaveBeenCalled()

		await act(async () => {
			await result.current.signInAsync(creds)
			await flushNotifications()
		})
		expect(posthog.capture).toHaveBeenCalledWith('signed_in', { method: 'email' })
	})

	it('tracks an accepted sign-up request and an OAuth sign-in', async () => {
		mockCreateUser.mockResolvedValue({ user: null, hasSession: false })
		mockGoogle.mockResolvedValue(undefined)
		const { result } = await renderAuth()

		await act(async () => {
			await result.current.createUserAsync(creds)
			await flushNotifications()
		})
		expect(posthog.capture).toHaveBeenCalledWith('sign_up_submitted', undefined)

		await act(async () => {
			result.current.signInWithGoogle()
			await flushNotifications()
		})
		expect(posthog.capture).toHaveBeenCalledWith('signed_in', { method: 'google' })
	})
})
