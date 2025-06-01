import { AppleAuthProvider, FirebaseAuthTypes, getAuth, GoogleAuthProvider } from '@react-native-firebase/auth'
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto'
import i18next from 'i18next'
import useToast from '@app/hooks/useToast'
import { getErrorData, logger } from '@app/utils'

export const authErrors = {
	codes: {
		'[auth/invalid-credential]': i18next.t('error.invalidEmailOrPassword'),
		'1000': null,
	},
	messages: {
		'GoogleSignIn cancelled': null,
	},
}

export const handleAuthErrors = (e: unknown) => {
	const { code, message } = getErrorData(e)
	const showToast = useToast.getState().showToast

	if (code && code in authErrors.codes) {
		const errorMessage = authErrors.codes[code as keyof typeof authErrors.codes]
		if (errorMessage) {
			showToast(errorMessage, 'error')
		}
		return
	}

	if (message && message in authErrors.messages) {
		const errorMessage = authErrors.messages[message as keyof typeof authErrors.messages]
		if (errorMessage) {
			showToast(errorMessage, 'error')
		}
		return
	}

	logger.error(new Error(`${message}`))

	showToast(message, 'error')
}

export const getGoogleAuthCredential = async () => {
	const res = await GoogleSignin.signIn()

	if (!isSuccessResponse(res)) {
		throw new Error(`GoogleSignIn ${res.type}`)
	}

	return GoogleAuthProvider.credential(res.data.idToken)
}

export const getAppleAuthCredential = async () => {
	const nonce = await digestStringAsync(CryptoDigestAlgorithm.SHA256, Math.random().toString(36).substring(2, 10))

	const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
		nonce,
		requestedScopes: [
			AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
			AppleAuthentication.AppleAuthenticationScope.EMAIL,
		],
	})

	if (!appleAuthRequestResponse.identityToken) {
		throw new Error('Apple Sign-In failed - no identify token returned')
	}

	const { identityToken } = appleAuthRequestResponse

	return AppleAuthProvider.credential(identityToken, nonce)
}

export const signInWithProvider = async (getCredential: () => Promise<FirebaseAuthTypes.AuthCredential>) => {
	const providerCredential = await getCredential()
	await getAuth().signInWithCredential(providerCredential)
}

export const signIn = async (email: string, password: string) => {
	await getAuth().signInWithEmailAndPassword(email, password)
}

export const createUser = async (email: string, password: string) => {
	await getAuth().createUserWithEmailAndPassword(email, password)
}

export const signOut = async () => {
	await getAuth().signOut()
}
