import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, PersistOptions, StateStorage } from 'zustand/middleware'
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
} from '@app/api/auth'
import { authStorage } from '@app/storage'
import useToast from './useToast'

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

const persistStorage: StateStorage = {
	setItem: (name, value) => authStorage.set(name, value),
	getItem: name => authStorage.getString(name) || null,
	removeItem: name => authStorage.remove(name),
}

const persistConfig: PersistOptions<AuthStore> = {
	name: 'auth',
	storage: createJSONStorage(() => persistStorage),
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

const useAuth = () => {
	const showToast = useToast(state => state.showToast)

	const onError = (error: unknown) => {
		const message = getAuthErrorMessage(error)
		if (message) showToast(message, 'error')
	}

	const { mutate: createUser, isPending: isCreateUserPending } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => authCreateUser(email, password),
		onError,
	})

	const { mutate: signIn, isPending: isSignInPending } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => authSignIn(email, password),
		onError,
	})

	const { mutate: signInWithGoogle, isPending: isSignInWithGooglePending } = useMutation({
		mutationFn: () => authSignInWithGoogle(),
		onError,
	})

	const { mutate: signInWithApple, isPending: isSignInWithApplePending } = useMutation({
		mutationFn: () => authSignInWithApple(),
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

	const {
		mutate: sendPasswordResetEmail,
		mutateAsync: sendPasswordResetEmailAsync,
		isPending: isSendPasswordResetEmailPending,
	} = useMutation({
		mutationFn: ({ email }: { email: string }) => authSendPasswordResetEmail(email),
		onError,
	})

	const {
		mutate: updatePassword,
		mutateAsync: updatePasswordAsync,
		isPending: isUpdatePasswordPending,
	} = useMutation({
		mutationFn: ({ password }: { password: string }) => authUpdatePassword(password),
		onError,
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
		signIn,
		signInWithGoogle,
		signInWithApple,
		createUser,
		signOut,
		signOutAsync,
		sendPasswordResetEmail,
		sendPasswordResetEmailAsync,
		updatePassword,
		updatePasswordAsync,
		loading,
	}
}

export default useAuth
