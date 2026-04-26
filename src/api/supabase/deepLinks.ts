import type { EmailOtpType } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'
import { supabase } from './client'

type AuthLinkParams = {
	access_token?: string
	refresh_token?: string
	token_hash?: string
	type?: string
	error?: string
	error_code?: string
	error_description?: string
}

function parsePairs(input: string): Record<string, string> {
	const params = new URLSearchParams(input)
	return Object.fromEntries(params.entries())
}

function getAuthLinkParams(url: string): AuthLinkParams {
	const [withoutHash, hash = ''] = url.split('#')
	const queryString = withoutHash.includes('?') ? withoutHash.split('?')[1] : ''
	return { ...parsePairs(queryString), ...parsePairs(hash) }
}

function isEmailOtpType(value: string | undefined): value is EmailOtpType {
	return (
		value === 'signup' ||
		value === 'invite' ||
		value === 'magiclink' ||
		value === 'recovery' ||
		value === 'email_change'
	)
}

export function createResetPasswordRedirectUrl(): string {
	return Linking.createURL('ResetPassword')
}

export function isPasswordRecoveryUrl(url: string): boolean {
	return getAuthLinkParams(url).type === 'recovery'
}

async function getSessionUserId(): Promise<string | null> {
	const { data, error } = await supabase.auth.getSession()
	if (error) throw error
	return data.session?.user?.id ?? null
}

export async function restoreSupabaseSessionFromUrl(
	url: string,
): Promise<{ handled: boolean; type: string | null; userId: string | null }> {
	const params = getAuthLinkParams(url)

	if (params.error || params.error_code) {
		throw new Error(params.error_description || params.error || params.error_code)
	}

	if (params.access_token && params.refresh_token) {
		const { error } = await supabase.auth.setSession({
			access_token: params.access_token,
			refresh_token: params.refresh_token,
		})
		if (error) throw error
		const userId = await getSessionUserId()
		return { handled: true, type: params.type ?? null, userId }
	}

	if (params.token_hash && isEmailOtpType(params.type)) {
		const { error } = await supabase.auth.verifyOtp({ token_hash: params.token_hash, type: params.type })
		if (error) throw error
		const userId = await getSessionUserId()
		return { handled: true, type: params.type, userId }
	}

	return { handled: false, type: params.type ?? null, userId: null }
}
