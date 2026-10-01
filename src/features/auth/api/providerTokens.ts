import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import { CryptoDigestAlgorithm, digestStringAsync, getRandomValues } from 'expo-crypto'

function randomNonceHex(byteLength: number): string {
	const bytes = new Uint8Array(byteLength)
	getRandomValues(bytes)
	return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

export async function getGoogleIdToken(): Promise<{ idToken: string; hashedNonce: string }> {
	// Google's native SDKs (Android Credential Manager, iOS GIDSignIn 8.x) take the
	// passed nonce, hash it SHA-256, and embed the hash in id_token.nonce.
	// Supabase's Google OIDC verification compares the passed nonce string directly
	// against id_token.nonce — so we pass the *hashed* value here.
	const rawNonce = randomNonceHex(32)
	const hashedNonce = await digestStringAsync(CryptoDigestAlgorithm.SHA256, rawNonce)

	const res = await GoogleSignin.signIn()

	if (!isSuccessResponse(res)) {
		throw new Error(`GoogleSignIn ${res.type}`)
	}

	if (!res.data.idToken) {
		throw new Error('Google Sign-In failed - no ID token returned')
	}

	return { idToken: res.data.idToken, hashedNonce }
}

export async function getAppleIdentityToken(): Promise<{ identityToken: string; rawNonce: string }> {
	const rawNonce = randomNonceHex(32)
	const hashedNonce = await digestStringAsync(CryptoDigestAlgorithm.SHA256, rawNonce)

	const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
		nonce: hashedNonce,
		requestedScopes: [
			AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
			AppleAuthentication.AppleAuthenticationScope.EMAIL,
		],
	})

	if (!appleAuthRequestResponse.identityToken) {
		throw new Error('Apple Sign-In failed - no identity token returned')
	}

	return { identityToken: appleAuthRequestResponse.identityToken, rawNonce }
}
