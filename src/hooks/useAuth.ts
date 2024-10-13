import appleAuth from '@invertase/react-native-apple-authentication'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin'
import { useEffect } from 'react'
import { useStore } from '@app/store'
import { getErrorData, logger } from '@app/utils'
import { AppError } from '@app/utils/logger'

const nonErrors: {
	codes: string[]
	messages: string[]
} = { codes: ['1000'], messages: ['GoogleSignIn cancelled'] }

const shouldIgnoreError = (e: { code?: string; message: string }) => {
	if (e.code && nonErrors.codes.find(el => el === e.code)) {
		return true
	}
	if (e.message && nonErrors.messages.find(el => el === e.message)) {
		return true
	}
	return false
}

const useAuth = () => {
	const loading = useStore(state => state.auth.loading)
	const setLoading = useStore(state => state.setLoading)
	const setUser = useStore(state => state.setUser)
	const setError = useStore(state => state.setError)
	const showToast = useStore(state => state.showToast)

	const handleErrors = (e: unknown) => {
		const { code, message } = getErrorData(e)
		if (shouldIgnoreError({ code, message })) {
			return
		}
		logger.error(e as AppError)
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
		auth().onAuthStateChanged(setUser)
	}, [])

	const getGoogleAuthCredential = async () => {
		const res = await GoogleSignin.signIn()
		if (!isSuccessResponse(res)) {
			throw new Error(`GoogleSignIn ${res.type}`)
		}
		return auth.GoogleAuthProvider.credential(res.data.idToken)
	}

	const getAppleAuthCredential = async () => {
		const appleAuthRequestResponse = await appleAuth.performRequest({
			requestedOperation: appleAuth.Operation.LOGIN,
			requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
		})
		if (!appleAuthRequestResponse.identityToken) {
			throw new Error('Apple Sign-In failed - no identify token returned')
		}
		const { identityToken, nonce } = appleAuthRequestResponse
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
