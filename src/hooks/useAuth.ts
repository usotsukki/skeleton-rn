import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto'
import i18next from 'i18next'
import { useEffect } from 'react'
import { useGlobalStore } from '@app/store'
import { getErrorData, logger } from '@app/utils'
import useToast from './useToast'

const authErrors = {
	codes: {
		'[auth/invalid-credential]': i18next.t('error.invalidEmailOrPassword'),
		'1000': null,
	},
	messages: {
		'GoogleSignIn cancelled': null,
	},
}

const useAuth = () => {
	const loading = useGlobalStore(state => state.auth.loading)
	const setLoading = useGlobalStore(state => state.setLoading)
	const setUser = useGlobalStore(state => state.setUser)
	const setError = useGlobalStore(state => state.setError)
	const showToast = useToast(state => state.showToast)

	const handleErrors = (e: unknown) => {
		const { code, message } = getErrorData(e)

		if (code && code in authErrors.codes) {
			const errorMessage = authErrors.codes[code as keyof typeof authErrors.codes]
			if (errorMessage) {
				showToast(errorMessage, 'error')
				setError(errorMessage)
			}
			return
		}

		if (message && message in authErrors.messages) {
			const errorMessage = authErrors.messages[message as keyof typeof authErrors.messages]
			if (errorMessage) {
				setError(errorMessage)
				showToast(errorMessage, 'error')
			}
			return
		}

		logger.error(new Error(`${message}`))
		setError(message)
		showToast(message, 'error')
	}

	const withLoading = async <T>(fn: () => Promise<T>): Promise<T | void> => {
		if (loading) {
			return
		}
		try {
			setLoading(true)
			setError(null)
			return await fn()
		} catch (e) {
			handleErrors(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(setUser)
		return unsubscribe
	}, [])

	const getGoogleAuthCredential = async () => {
		const res = await GoogleSignin.signIn()

		if (!isSuccessResponse(res)) {
			throw new Error(`GoogleSignIn ${res.type}`)
		}

		return auth.GoogleAuthProvider.credential(res.data.idToken)
	}

	const getAppleAuthCredential = async () => {
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

		return auth.AppleAuthProvider.credential(identityToken, nonce)
	}

	const signIn = async (email: string, password: string) => {
		return await withLoading(() => auth().signInWithEmailAndPassword(email, password))
	}

	const signInWithProvider = async (getCredential: () => Promise<FirebaseAuthTypes.AuthCredential>) => {
		const providerCredential = await getCredential()
		await auth().signInWithCredential(providerCredential)
	}

	const signInWithGoogle = () => withLoading(() => signInWithProvider(getGoogleAuthCredential))
	const signInWithApple = () => withLoading(() => signInWithProvider(getAppleAuthCredential))

	const createUser = async (email: string, password: string) => {
		withLoading(() => auth().createUserWithEmailAndPassword(email, password))
	}

	const signOut = async () => {
		withLoading(() => auth().signOut())
	}

	return { signIn, signInWithGoogle, createUser, signInWithApple, signOut, loading }
}

export default useAuth
