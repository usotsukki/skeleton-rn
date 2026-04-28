import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AuthCredentialsForm, AuthScreen } from '@app/components/auth'
import useAuth from '@app/hooks/useAuth'

export default function SignUp() {
	const { t } = useTranslation()
	const router = useRouter()
	const { createUser, signInWithGoogle, signInWithApple, loading } = useAuth()

	return (
		<AuthScreen>
			<AuthCredentialsForm
				actionLabel={t('signIn')}
				loading={loading}
				onActionPress={() => router.replace('/SignIn')}
				onApple={() => signInWithApple()}
				onGoogle={() => signInWithGoogle()}
				onSubmit={createUser}
				promptText={t('modules.auth.alreadyHaveAccount')}
				submitLabel={t('signUp')}
				subtitle={t('modules.auth.signUpSubtitle')}
				title={t('modules.auth.signUpTitle')}
			/>
		</AuthScreen>
	)
}
