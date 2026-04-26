import { getAuthErrorMessage } from './authErrorMessages'
import {
	createSupabaseUser,
	getCurrentSupabaseAuthUser,
	sendSupabasePasswordResetEmail,
	signInWithSupabase,
	signInWithSupabaseApple,
	signInWithSupabaseGoogle,
	signOutFromSupabase,
	subscribeToSupabaseAuthChanges,
	updateSupabasePassword,
} from './supabase'
import type { AuthUser, CreateUserResult } from './types'

export type { AuthUser, CreateUserResult }

export { getAuthErrorMessage }

export const subscribeToAuthChanges = async (cb: (user: AuthUser | null, event: string) => void) =>
	subscribeToSupabaseAuthChanges(cb)

export const getCurrentAuthUser = async () => getCurrentSupabaseAuthUser()

export const signIn = async (email: string, password: string) => {
	await signInWithSupabase(email, password)
}

export const createUser = async (email: string, password: string): Promise<CreateUserResult> => {
	return createSupabaseUser(email, password)
}

export const signInWithGoogle = async () => {
	await signInWithSupabaseGoogle()
}

export const signInWithApple = async () => {
	await signInWithSupabaseApple()
}

export const signOut = async () => {
	await signOutFromSupabase()
}

export const sendPasswordResetEmail = async (email: string) => {
	await sendSupabasePasswordResetEmail(email)
}

export const updatePassword = async (password: string) => {
	await updateSupabasePassword(password)
}
