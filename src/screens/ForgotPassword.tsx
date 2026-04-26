import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, AuthEmailInput, FormSubmitFooter, ScreenHeader } from '@app/components/shared'
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
		<SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
			<ScreenHeader
				className="px-5 pb-2 pt-2"
				leading={{ kind: 'back', onPress: router.back, a11yLabel: t('modules.common.close') }}
				title={t('modules.auth.forgotPasswordTitle')}
			/>
			<KeyboardAwareScrollView
				bottomOffset={40}
				contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
				<AppText className="mb-6 text-text-secondary" variant="tm">
					{t('modules.auth.forgotPasswordSubtitle')}
				</AppText>
				<AuthEmailInput label={t('modules.auth.email')} onChangeText={setEmail} value={email} />
				<FormSubmitFooter
					disabled={loading || !email.trim()}
					label={t('modules.auth.sendResetEmail')}
					onPress={onSubmit}
				/>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}
