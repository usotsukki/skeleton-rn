import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, AuthPasswordInput, FormSubmitFooter, ScreenHeader } from '@app/components/shared'
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
		<SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
			<ScreenHeader
				className="px-5 pb-2 pt-2"
				leading={{ kind: 'none' }}
				title={t('modules.auth.resetPasswordTitle')}
			/>
			<KeyboardAwareScrollView
				bottomOffset={40}
				contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
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
				<FormSubmitFooter
					disabled={loading || !password || !confirm || mismatch}
					label={t('modules.auth.resetPasswordButton')}
					onPress={onSubmit}
				/>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}
