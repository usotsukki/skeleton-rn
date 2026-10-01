import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import useAlert from '@app/shared/hooks/useAlert'
import { AuthCredentialsForm, AuthScreen } from './components'
import useAuth from './hooks/useAuth'

export default function SignUp() {
	const { t } = useTranslation()
	const router = useRouter()
	const { createUserAsync, signInWithGoogle, signInWithApple, loading, pending } = useAuth()

	// A rejection (e.g. the email is taken) propagates: the form shows it inline.
	const onSubmit = async ({ email, password }: { email: string; password: string }) => {
		const result = await createUserAsync({ email, password })
		// With a session the auth listener navigates. Without one, Supabase sent a confirmation email:
		// say so, or the screen just sits there with the form still filled.
		if (result.hasSession) return
		useAlert.getState().showAlert({
			variant: 'success',
			title: t('modules.auth.checkEmailTitle'),
			description: t('modules.auth.checkEmailBody', { email }),
			continueButtonText: t('modules.auth.goToSignIn'),
			onContinue: () => router.replace('/SignIn'),
		})
	}

	return (
		<AuthScreen>
			<AuthCredentialsForm
				actionLabel={t('signIn')}
				loading={loading}
				oauthLoading={pending.oauth}
				submitting={pending.credentials}
				onActionPress={() => router.replace('/SignIn')}
				onApple={() => signInWithApple()}
				onGoogle={() => signInWithGoogle()}
				onSubmit={onSubmit}
				promptText={t('modules.auth.alreadyHaveAccount')}
				submitLabel={t('signUp')}
				subtitle={t('modules.auth.signUpSubtitle')}
				title={t('modules.auth.signUpTitle')}
			/>
		</AuthScreen>
	)
}
