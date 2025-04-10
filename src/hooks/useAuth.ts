import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, PersistOptions, StateStorage } from 'zustand/middleware'
import {
	createUser as authCreateUser,
	signIn as authSignIn,
	signOut as authSignOut,
	getAppleAuthCredential,
	getGoogleAuthCredential,
	handleAuthErrors,
	signInWithProvider,
} from '@app/api/auth'
import { authStorage } from '@app/storage'

interface AuthState {
	user: FirebaseAuthTypes.User | null
}

interface AuthStore extends AuthState {
	setUser: (user: FirebaseAuthTypes.User | null) => void
}

const persistStorage: StateStorage = {
	setItem: (name, value) => authStorage.set(name, value),
	getItem: name => authStorage.getString(name) || null,
	removeItem: name => authStorage.delete(name),
}

const persistConfig: PersistOptions<AuthStore> = {
	name: 'auth',
	storage: createJSONStorage(() => persistStorage),
}

export const useAuthStore = create(
	persist(
		set => ({
			user: null,
			setUser: (user: FirebaseAuthTypes.User | null) => set({ user }),
		}),
		persistConfig,
	),
)

export const useAuthListener = () => {
	const setUser = useAuthStore(state => state.setUser)

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(setUser)
		return unsubscribe
	}, [])
}

const useAuth = () => {
	const { mutate: createUser, isPending: isCreateUserPending } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => {
			return authCreateUser(email, password)
		},
		onError: handleAuthErrors,
	})

	const { mutate: signIn, isPending: isSignInPending } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => {
			return authSignIn(email, password)
		},
		onError: handleAuthErrors,
	})

	const { mutate: signInWithGoogle, isPending: isSignInWithGooglePending } = useMutation({
		mutationFn: () => signInWithProvider(getGoogleAuthCredential),
		onError: handleAuthErrors,
	})

	const { mutate: signInWithApple, isPending: isSignInWithApplePending } = useMutation({
		mutationFn: () => signInWithProvider(getAppleAuthCredential),
		onError: handleAuthErrors,
	})

	const { mutate: signOut, isPending: isSignOutPending } = useMutation({
		mutationFn: () => authSignOut(),
		onError: handleAuthErrors,
	})

	const loading =
		isSignInPending || isSignInWithGooglePending || isSignInWithApplePending || isCreateUserPending || isSignOutPending

	return { signIn, signInWithGoogle, signInWithApple, createUser, signOut, loading }
}

export default useAuth
