import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as Linking from 'expo-linking'
import { supabase } from '@app/shared/api/supabase/client'
import useToast from '@app/shared/hooks/useToast'
import { PASSWORD_RECOVERY_PENDING, useAuthStore } from '../useAuth'
import { useAuthDeepLink } from '../useAuthDeepLink'

const mockReplace = jest.fn()
// A stable router: the hook re-subscribes when its identity changes.
jest.mock('expo-router', () => {
	const router = { replace: (href: string) => mockReplace(href) }
	return { useRouter: () => router }
})

// The real message mapping; the rest of the auth API (native Google / Apple modules) isn't needed.
jest.mock('../../api', () => ({
	getAuthErrorMessage: jest.requireActual('../../api/authErrorMessages').getAuthErrorMessage,
}))

jest.mock('@app/shared/api/supabase/client', () => ({
	supabase: {
		auth: {
			setSession: jest.fn(),
			verifyOtp: jest.fn(),
			getSession: jest.fn(),
		},
	},
}))

const auth = jest.mocked(supabase.auth)
const linking = jest.mocked(Linking)

const RECOVERY_LINK = 'app://ResetPassword?token_hash=hash123&type=recovery'
const EXPIRED_LINK =
	'app://ResetPassword#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'

function signedInAs(id: string) {
	auth.verifyOtp.mockResolvedValue({ data: {}, error: null } as never)
	auth.setSession.mockResolvedValue({ data: {}, error: null } as never)
	auth.getSession.mockResolvedValue({ data: { session: { user: { id } } }, error: null } as never)
}

/** Captures the `url` listener the hook registers. */
function urlListener() {
	const [[, listener]] = linking.addEventListener.mock.calls as unknown as [[string, (e: { url: string }) => void]]
	return listener
}

describe('useAuthDeepLink', () => {
	beforeEach(() => {
		mockReplace.mockClear()
		linking.getInitialURL.mockResolvedValue(null)
		jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('opens the reset screen for a recovery link that started the app', async () => {
		signedInAs('user-1')
		linking.getInitialURL.mockResolvedValue(RECOVERY_LINK)

		await renderHook(() => useAuthDeepLink())

		await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/ResetPassword'))
		expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'hash123', type: 'recovery' })
		expect(useAuthStore.getState().passwordRecoveryUserId).toBe('user-1')
	})

	it('restores an implicit-flow recovery session from the URL fragment', async () => {
		signedInAs('user-2')
		await renderHook(() => useAuthDeepLink())

		await act(() => urlListener()({ url: 'app://ResetPassword#access_token=a&refresh_token=r&type=recovery' }))

		expect(auth.setSession).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r' })
		expect(mockReplace).toHaveBeenCalledWith('/ResetPassword')
		expect(useAuthStore.getState().passwordRecoveryUserId).toBe('user-2')
	})

	it('shows the expired-link message and clears the pending recovery', async () => {
		const showToast = jest.fn()
		useToast.setState({ showToast })
		await renderHook(() => useAuthDeepLink())

		await act(() => urlListener()({ url: `${EXPIRED_LINK}&type=recovery` }))

		expect(showToast).toHaveBeenCalledWith('error.passwordResetLinkInvalid', 'error')
		expect(useAuthStore.getState().passwordRecoveryUserId).toBeNull()
		expect(mockReplace).not.toHaveBeenCalled()
	})

	it('marks recovery as pending while the link is verified', async () => {
		let finish: (value: unknown) => void = () => {}
		auth.verifyOtp.mockReturnValue(
			new Promise(resolve => {
				finish = resolve
			}) as never,
		)
		auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-3' } } }, error: null } as never)
		await renderHook(() => useAuthDeepLink())

		const pending = urlListener()({ url: RECOVERY_LINK })
		expect(useAuthStore.getState().passwordRecoveryUserId).toBe(PASSWORD_RECOVERY_PENDING)

		await act(async () => {
			finish({ data: {}, error: null })
			await pending
		})
		expect(useAuthStore.getState().passwordRecoveryUserId).toBe('user-3')
	})

	it('ignores links that are not auth links', async () => {
		await renderHook(() => useAuthDeepLink())
		await act(() => urlListener()({ url: 'app://Home' }))

		expect(auth.verifyOtp).not.toHaveBeenCalled()
		expect(auth.setSession).not.toHaveBeenCalled()
		expect(mockReplace).not.toHaveBeenCalled()
		expect(useAuthStore.getState().passwordRecoveryUserId).toBeNull()
	})

	it('unsubscribes on unmount', async () => {
		const remove = jest.fn()
		linking.addEventListener.mockReturnValueOnce({ remove } as never)
		const { unmount } = await renderHook(() => useAuthDeepLink())
		await unmount()
		expect(remove).toHaveBeenCalledTimes(1)
	})
})
