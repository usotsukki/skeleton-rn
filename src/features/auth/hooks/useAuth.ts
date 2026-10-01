import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { trackEvent } from '@app/shared/api/analytics'
import useToast from '@app/shared/hooks/useToast'
import { authStorage } from '@app/shared/storage'
import { createPersistStorage } from '@app/shared/storage/persistStorage'
import {
	createUser as authCreateUser,
	sendPasswordResetEmail as authSendPasswordResetEmail,
	signIn as authSignIn,
	signInWithApple as authSignInWithApple,
	signInWithGoogle as authSignInWithGoogle,
	signOut as authSignOut,
	updatePassword as authUpdatePassword,
	type AuthUser,
	getAuthErrorMessage,
	subscribeToAuthChanges,
} from '../api'

/** Set in the auth store before recovery `setSession` runs so navigation does not jump to the app shell first. */
export const PASSWORD_RECOVERY_PENDING = '__password_recovery_pending__'

interface AuthState {
	user: AuthUser | null
	staySignedIn: boolean
	passwordRecoveryUserId: string | null
	pendingPostAuthRoute: string | null
	hydrated: boolean
}

interface AuthStore extends AuthState {
	setUser: (user: AuthUser | null) => void
	setStaySignedIn: (stay: boolean) => void
	setPasswordRecoveryUserId: (uid: string | null) => void
	setPendingPostAuthRoute: (route: string | null) => void
	setHydrated: (hydrated: boolean) => void
}

const persistConfig: PersistOptions<AuthStore> = {
	name: 'auth',
	storage: createPersistStorage<AuthStore>(authStorage),
	partialize: state =>
		({
			user: state.user,
			staySignedIn: state.staySignedIn,
			passwordRecoveryUserId: state.passwordRecoveryUserId,
		}) as AuthStore,
}

export const useAuthStore = create<AuthStore>()(
	persist(
		set => ({
			user: null,
			staySignedIn: true,
			passwordRecoveryUserId: null,
			pendingPostAuthRoute: null,
			hydrated: false,
			setUser: (user: AuthUser | null) => set({ user }),
			setStaySignedIn: (stay: boolean) => set({ staySignedIn: stay }),
			setPasswordRecoveryUserId: (uid: string | null) => set({ passwordRecoveryUserId: uid }),
			setPendingPostAuthRoute: (route: string | null) => set({ pendingPostAuthRoute: route }),
			setHydrated: (hydrated: boolean) => set({ hydrated }),
		}),
		persistConfig,
	),
)

export function useCurrentUid() {
	return useAuthStore(state => state.user?.uid ?? null)
}

export const useAuthListener = (cb: (user: AuthUser | null, event: string) => void) => {
	const setUser = useAuthStore(state => state.setUser)
	const staySignedIn = useAuthStore(state => state.staySignedIn)
	const lastSyncedRef = useRef<{ uid: string; at: number } | null>(null)

	useEffect(() => {
		let isActive = true
		let unsubscribe = () => {}
		let shouldUnsubscribeImmediately = false

		const persistNullAuthEvents = new Set<string>(['INITIAL_SESSION', 'SIGNED_OUT', 'USER_DELETED'])

		const callback = (user: AuthUser | null, event: string) => {
			if (!isActive) return
			setUser(user)
			if (!useAuthStore.getState().hydrated) {
				useAuthStore.getState().setHydrated(true)
			}
			if (!user && persistNullAuthEvents.has(event) && useAuthStore.getState().passwordRecoveryUserId) {
				useAuthStore.getState().setPasswordRecoveryUserId(null)
			}
			if (user) {
				const now = Date.now()
				if (lastSyncedRef.current && lastSyncedRef.current.uid === user.uid && now - lastSyncedRef.current.at < 2000) {
					cb(user, event)
					return
				}
				lastSyncedRef.current = { uid: user.uid, at: now }
			} else {
				lastSyncedRef.current = null
			}
			cb(user, event)
		}

		const bootstrap = async () => {
			if (!staySignedIn) {
				try {
					await authSignOut()
				} catch {
					// already signed out
				}
			}
			if (!isActive) return
			try {
				const next = await Promise.resolve(subscribeToAuthChanges(callback))
				if (shouldUnsubscribeImmediately || !isActive) {
					next()
					return
				}
				unsubscribe = next
			} catch (err) {
				console.error('[useAuthListener] subscribe failed', err)

				if (!useAuthStore.getState().hydrated) useAuthStore.getState().setHydrated(true)
			}
		}

		bootstrap().catch(err => {
			console.error('[useAuthListener] bootstrap failed', err)
			if (!useAuthStore.getState().hydrated) useAuthStore.getState().setHydrated(true)
		})

		return () => {
			isActive = false
			shouldUnsubscribeImmediately = true
			unsubscribe()
		}
	}, [staySignedIn])
}

function oauthPending(google: boolean, apple: boolean): 'google' | 'apple' | undefined {
	if (google) return 'google'
	if (apple) return 'apple'
	return undefined
}

const useAuth = () => {
	const showToast = useToast(state => state.showToast)

	const onError = (error: unknown) => {
		const message = getAuthErrorMessage(error)
		if (message) showToast(message, 'error')
	}

	// Email/password requests: the form shows their errors inline (getAuthFormError), so no toast here.
	const { mutateAsync: createUserAsync, isPending: isCreateUserPending } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => authCreateUser(email, password),
		onSuccess: () => trackEvent('sign_up_submitted'),
	})

	const { mutateAsync: signInAsync, isPending: isSignInPending } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => authSignIn(email, password),
		onSuccess: () => trackEvent('signed_in', { method: 'email' }),
	})

	// OAuth has no separate sign-up signal: a first Google/Apple sign-in creates the account.
	const { mutate: signInWithGoogle, isPending: isSignInWithGooglePending } = useMutation({
		mutationFn: () => authSignInWithGoogle(),
		onSuccess: () => trackEvent('signed_in', { method: 'google' }),
		onError,
	})

	const { mutate: signInWithApple, isPending: isSignInWithApplePending } = useMutation({
		mutationFn: () => authSignInWithApple(),
		onSuccess: () => trackEvent('signed_in', { method: 'apple' }),
		onError,
	})

	const {
		mutate: signOut,
		mutateAsync: signOutAsync,
		isPending: isSignOutPending,
	} = useMutation({
		mutationFn: () => authSignOut(),
		onError,
	})

	const { mutateAsync: sendPasswordResetEmailAsync, isPending: isSendPasswordResetEmailPending } = useMutation({
		mutationFn: ({ email }: { email: string }) => authSendPasswordResetEmail(email),
	})

	const { mutateAsync: updatePasswordAsync, isPending: isUpdatePasswordPending } = useMutation({
		mutationFn: ({ password }: { password: string }) => authUpdatePassword(password),
	})

	const loading =
		isSignInPending ||
		isSignInWithGooglePending ||
		isSignInWithApplePending ||
		isCreateUserPending ||
		isSignOutPending ||
		isSendPasswordResetEmailPending ||
		isUpdatePasswordPending

	return {
		/** Rejects on failure; the caller shows the error (auth forms: inline). */
		signInAsync,
		signInWithGoogle,
		signInWithApple,
		createUserAsync,
		signOut,
		signOutAsync,
		sendPasswordResetEmailAsync,
		updatePasswordAsync,
		loading,
		/** Which auth request is running, so the matching control can show a spinner. */
		pending: {
			credentials: isSignInPending || isCreateUserPending,
			google: isSignInWithGooglePending,
			apple: isSignInWithApplePending,
			/** The OAuth provider whose request is running, if any. */
			oauth: oauthPending(isSignInWithGooglePending, isSignInWithApplePending),
		},
	}
}

export default useAuth
