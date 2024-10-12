import appleAuth from '@invertase/react-native-apple-authentication'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin'
import { useEffect, useState } from 'react'

GoogleSignin.configure()

const useAuth = () => {
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
	const [loading, setLoading] = useState(false)

	const withLoading = async <T>(fn: () => Promise<T>) => {
		if (loading) {
			return
		}
		try {
			setLoading(true)
			return await fn()
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		auth().onAuthStateChanged(setUser)
	}, [])

	const getGoogleAuthCredential = async () => {
		await GoogleSignin.hasPlayServices()
		const res = await GoogleSignin.signIn()
		if (!isSuccessResponse(res)) {
			throw new Error('Google Signin failed')
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

	return { user, signIn, signInWithGoogle, createUser, signInWithApple, signOut, loading }
}

export default useAuth
