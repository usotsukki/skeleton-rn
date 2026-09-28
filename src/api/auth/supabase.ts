import { supabase } from '@app/api/supabase/client'
import { createResetPasswordRedirectUrl } from '@app/api/supabase/deepLinks'
import { getAppleIdentityToken, getGoogleIdToken } from './providerTokens'
import type { AuthUser, CreateUserResult } from './types'

function toAuthUser(
	user:
		| { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> | null }
		| null
		| undefined,
): AuthUser | null {
	if (!user) return null
	const metadata = user.user_metadata ?? {}
	return {
		uid: user.id,
		email: user.email ?? null,
		phoneNumber: user.phone ?? null,
		displayName:
			(typeof metadata.displayName === 'string' && metadata.displayName) ||
			(typeof metadata.full_name === 'string' && metadata.full_name) ||
			(typeof metadata.name === 'string' && metadata.name) ||
			null,
		photoURL:
			(typeof metadata.photoURL === 'string' && metadata.photoURL) ||
			(typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
			null,
	}
}

export async function getCurrentSupabaseAuthUser(): Promise<AuthUser | null> {
	const { data, error } = await supabase.auth.getSession()
	if (error) throw error
	return toAuthUser(data.session?.user)
}

export async function subscribeToSupabaseAuthChanges(
	cb: (user: AuthUser | null, event: string) => void,
): Promise<() => void> {
	const {
		data: { subscription },
	} = supabase.auth.onAuthStateChange((event, session) => {
		cb(toAuthUser(session?.user), event)
	})
	return () => subscription.unsubscribe()
}

export async function signInWithSupabase(email: string, password: string): Promise<void> {
	const { error } = await supabase.auth.signInWithPassword({ email, password })
	if (error) throw error
}

export async function createSupabaseUser(email: string, password: string): Promise<CreateUserResult> {
	const { data, error } = await supabase.auth.signUp({ email, password })
	if (error) throw error
	return { user: toAuthUser(data.user), hasSession: !!data.session }
}

export async function signInWithSupabaseGoogle(): Promise<void> {
	const { idToken, hashedNonce } = await getGoogleIdToken()
	const { error } = await supabase.auth.signInWithIdToken({
		provider: 'google',
		token: idToken,
		nonce: hashedNonce,
	})
	if (error) throw error
}

export async function signInWithSupabaseApple(): Promise<void> {
	const { identityToken, rawNonce } = await getAppleIdentityToken()
	const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken, nonce: rawNonce })
	if (error) throw error
}

export async function signOutFromSupabase(): Promise<void> {
	const { error } = await supabase.auth.signOut()
	if (error) throw error
}

export async function sendSupabasePasswordResetEmail(email: string): Promise<void> {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: createResetPasswordRedirectUrl(),
	})
	if (error) throw error
}

export async function updateSupabasePassword(password: string): Promise<void> {
	const { error } = await supabase.auth.updateUser({ password })
	if (error) throw error
}

/**
 * React Native contract (auth-js `startAutoRefresh` docs): the OS suspends JS timers in the
 * background, so token auto-refresh must stop there and restart on foreground. Otherwise the client
 * can resume holding an expired access token and requests fail until the next refresh tick.
 */
export function setSupabaseAutoRefresh(active: boolean): void {
	const toggle = active ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
	toggle.catch(err => console.warn('[auth] auto-refresh toggle failed', err))
}
