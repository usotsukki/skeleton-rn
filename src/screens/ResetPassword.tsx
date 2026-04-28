import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { AuthScreen } from '@app/components/auth'
import { AppText, AuthPasswordInput, FormSubmitFooter } from '@app/components/shared'
import useAuth, { useAuthStore } from '@app/hooks/useAuth'
import useToast from '@app/hooks/useToast'

export default function ResetPassword() {
	const { t } = useTranslation()
	const router = useRouter()
	const showToast = useToast(s => s.showToast)
	const setPasswordRecoveryUserId = useAuthStore(s => s.setPasswordRecoveryUserId)
	const { updatePasswordAsync, loading } = useAuth()
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')

	const mismatch = password.length > 0 && confirm.length > 0 && password !== confirm

	const onSubmit = async () => {
		try {
			await updatePasswordAsync({ password })
			setPasswordRecoveryUserId(null)
			showToast(t('modules.auth.resetPasswordComplete'), 'success')
			router.replace('/Home')
		} catch {
			// onError already shows toast
		}
	}

	return (
		<AuthScreen paddingTop={64} headerLeading={{ kind: 'none' }} headerTitle={t('modules.auth.resetPasswordTitle')}>
			<AppText className="mb-6 text-text-secondary" variant="tm">
				{t('modules.auth.resetPasswordInstructions')}
			</AppText>
			<View className="gap-4">
				<AuthPasswordInput label={t('modules.auth.password')} onChangeText={setPassword} value={password} />
				<AuthPasswordInput
					errorMessage={mismatch ? t('error.passwordsDoNotMatch') : undefined}
					label={t('modules.auth.confirmPassword')}
					onChangeText={setConfirm}
					value={confirm}
				/>
			</View>
			<View className="mt-auto">
				<FormSubmitFooter
					disabled={loading || !password || !confirm || mismatch}
					label={t('modules.auth.resetPasswordButton')}
					onPress={onSubmit}
				/>
			</View>
		</AuthScreen>
	)
}
