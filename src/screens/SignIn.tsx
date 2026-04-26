import { useForm } from '@tanstack/react-form'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthFormEmailField, AuthFormPasswordField } from '@app/components/auth'
import { AppButton, AppText, AuthOAuthFooter, CheckboxInput, FormSubmitFooter } from '@app/components/shared'
import useAuth, { useAuthStore } from '@app/hooks/useAuth'
import { authCredentialsFormOpts } from '@app/utils/validators'

export default function SignIn() {
	const { t } = useTranslation()
	const router = useRouter()
	const { signIn, signInWithGoogle, signInWithApple, loading } = useAuth()
	const staySignedIn = useAuthStore(s => s.staySignedIn)
	const setStaySignedIn = useAuthStore(s => s.setStaySignedIn)

	const form = useForm({
		...authCredentialsFormOpts,
		onSubmit: ({ value }) => {
			signIn({ email: value.email, password: value.password })
		},
	})

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
			<KeyboardAwareScrollView
				bottomOffset={40}
				contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 }}>
				<View className="mb-8 gap-2">
					<AppText variant="disp">{t('modules.auth.signInTitle')}</AppText>
					<AppText className="text-text-secondary" variant="tm">
						{t('modules.auth.signInSubtitle')}
					</AppText>
				</View>

				<View className="gap-4">
					<form.Field name="email">
						{field => <AuthFormEmailField field={field} label={t('modules.auth.email')} />}
					</form.Field>
					<form.Field name="password">
						{field => <AuthFormPasswordField field={field} label={t('modules.auth.password')} />}
					</form.Field>

					<View className="flex-row items-center justify-between">
						<CheckboxInput
							label={t('modules.auth.staySignedIn')}
							onValueChange={setStaySignedIn}
							value={staySignedIn}
						/>
						<AppButton onPress={() => router.push('/ForgotPassword')} variant="link">
							{t('modules.auth.forgotPassword')}
						</AppButton>
					</View>
				</View>

				<form.Subscribe selector={state => state.canSubmit}>
					{canSubmit => (
						<FormSubmitFooter
							disabled={!canSubmit || loading}
							label={t('signIn')}
							onPress={() => {
								form.handleSubmit().catch(() => {
									// Invalid submit: validators already set field errors.
								})
							}}
						/>
					)}
				</form.Subscribe>

				<View className="mt-8">
					<AuthOAuthFooter
						actionLabel={t('signUp')}
						onAction={() => router.replace('/SignUp')}
						onApple={() => signInWithApple()}
						onGoogle={() => signInWithGoogle()}
						promptText={t('modules.auth.noAccount')}
					/>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}
