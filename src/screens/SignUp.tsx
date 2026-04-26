import { useForm } from '@tanstack/react-form'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthFormEmailField, AuthFormPasswordField } from '@app/components/auth'
import { AppText, AuthOAuthFooter, CheckboxInput, FormSubmitFooter } from '@app/components/shared'
import useAuth, { useAuthStore } from '@app/hooks/useAuth'
import { authCredentialsFormOpts } from '@app/utils/validators'

export default function SignUp() {
	const { t } = useTranslation()
	const router = useRouter()
	const { createUser, signInWithGoogle, signInWithApple, loading } = useAuth()
	const staySignedIn = useAuthStore(s => s.staySignedIn)
	const setStaySignedIn = useAuthStore(s => s.setStaySignedIn)

	const form = useForm({
		...authCredentialsFormOpts,
		onSubmit: ({ value }) => {
			createUser({ email: value.email, password: value.password })
		},
	})

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
			<KeyboardAwareScrollView
				bottomOffset={40}
				contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 }}>
				<View className="mb-8 gap-2">
					<AppText variant="disp">{t('modules.auth.signUpTitle')}</AppText>
					<AppText className="text-text-secondary" variant="tm">
						{t('modules.auth.signUpSubtitle')}
					</AppText>
				</View>

				<View className="gap-4">
					<form.Field name="email">
						{field => <AuthFormEmailField field={field} label={t('modules.auth.email')} />}
					</form.Field>
					<form.Field name="password">
						{field => <AuthFormPasswordField field={field} label={t('modules.auth.password')} />}
					</form.Field>
					<CheckboxInput label={t('modules.auth.staySignedIn')} onValueChange={setStaySignedIn} value={staySignedIn} />
				</View>

				<form.Subscribe selector={state => state.canSubmit}>
					{canSubmit => (
						<FormSubmitFooter
							disabled={!canSubmit || loading}
							label={t('signUp')}
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
						actionLabel={t('signIn')}
						onAction={() => router.replace('/SignIn')}
						onApple={() => signInWithApple()}
						onGoogle={() => signInWithGoogle()}
						promptText={t('modules.auth.alreadyHaveAccount')}
					/>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}
