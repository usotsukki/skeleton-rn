import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { AuthScreen } from '@app/components/auth'
import { AppText, AuthEmailInput, FormSubmitFooter } from '@app/components/shared'
import useAuth from '@app/hooks/useAuth'
import useToast from '@app/hooks/useToast'

export default function ForgotPassword() {
	const { t } = useTranslation()
	const router = useRouter()
	const showToast = useToast(s => s.showToast)
	const { sendPasswordResetEmailAsync, loading } = useAuth()
	const [email, setEmail] = useState('')

	const onSubmit = async () => {
		try {
			await sendPasswordResetEmailAsync({ email: email.trim() })
			showToast(t('modules.auth.resetEmailSent'), 'success')
			router.back()
		} catch {
			// onError already shows toast
		}
	}

	return (
		<AuthScreen
			paddingTop={64}
			headerLeading={{ kind: 'back', onPress: router.back, a11yLabel: t('modules.common.close') }}
			headerTitle={t('modules.auth.forgotPasswordTitle')}>
			<AppText className="mb-6 text-text-secondary" variant="tm">
				{t('modules.auth.forgotPasswordSubtitle')}
			</AppText>
			<AuthEmailInput label={t('modules.auth.email')} onChangeText={setEmail} value={email} />
			<View className="mt-auto">
				<FormSubmitFooter
					disabled={loading || !email.trim()}
					label={t('modules.auth.sendResetEmail')}
					onPress={onSubmit}
				/>
			</View>
		</AuthScreen>
	)
}
