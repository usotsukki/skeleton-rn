import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AuthCredentialsForm, AuthScreen } from '@app/components/auth'
import { AppButton } from '@app/components/shared'
import useAuth from '@app/hooks/useAuth'

export default function SignIn() {
	const { t } = useTranslation()
	const router = useRouter()
	const { signIn, signInWithGoogle, signInWithApple, loading } = useAuth()

	return (
		<AuthScreen>
			<AuthCredentialsForm
				actionLabel={t('signUp')}
				inlineFieldsAccessory={
					<AppButton onPress={() => router.push('/ForgotPassword')} variant="link">
						{t('modules.auth.forgotPassword')}
					</AppButton>
				}
				loading={loading}
				onActionPress={() => router.replace('/SignUp')}
				onApple={() => signInWithApple()}
				onGoogle={() => signInWithGoogle()}
				onSubmit={signIn}
				promptText={t('modules.auth.noAccount')}
				submitLabel={t('signIn')}
				subtitle={t('modules.auth.signInSubtitle')}
				title={t('modules.auth.signInTitle')}
			/>
		</AuthScreen>
	)
}
