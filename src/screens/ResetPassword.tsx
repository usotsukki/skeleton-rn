import { useRouter } from 'expo-router'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type TextInput, View } from 'react-native'
import { getAuthFormError } from '@app/api/auth'
import { AuthScreen } from '@app/components/auth'
import { focusFirstInvalid, setSubmitError, submitForm, useAppForm } from '@app/components/form'
import { AppText } from '@app/components/shared'
import useAuth, { useAuthStore } from '@app/hooks/useAuth'
import useToast from '@app/hooks/useToast'
import { resetPasswordFormOpts } from '@app/utils/validators'

export default function ResetPassword() {
	const { t } = useTranslation()
	const router = useRouter()
	const showToast = useToast(s => s.showToast)
	const setPasswordRecoveryUserId = useAuthStore(s => s.setPasswordRecoveryUserId)
	const { updatePasswordAsync, loading } = useAuth()
	const passwordRef = useRef<TextInput>(null)
	const confirmRef = useRef<TextInput>(null)

	const fieldRefs = [
		['password', passwordRef],
		['confirm', confirmRef],
	] as const

	const form = useAppForm({
		...resetPasswordFormOpts,
		onSubmit: async ({ value, formApi }) => {
			try {
				await updatePasswordAsync({ password: value.password })
			} catch (error) {
				const submitError = getAuthFormError(error)
				if (!submitError) return
				setSubmitError(formApi, submitError)
				focusFirstInvalid(formApi, fieldRefs)
				return
			}
			setPasswordRecoveryUserId(null)
			showToast(t('modules.auth.resetPasswordComplete'), 'success')
			router.replace('/Home')
		},
		onSubmitInvalid: ({ formApi }) => focusFirstInvalid(formApi, fieldRefs),
	})

	return (
		<AuthScreen paddingTop={64} headerLeading={{ kind: 'none' }} headerTitle={t('modules.auth.resetPasswordTitle')}>
			<AppText className="mb-6 text-text-secondary" variant="tm">
				{t('modules.auth.resetPasswordInstructions')}
			</AppText>
			<View className="gap-4">
				<form.AppField name="password">
					{field => (
						<field.PasswordField
							inputRef={passwordRef}
							label={t('modules.auth.password')}
							onSubmitEditing={() => confirmRef.current?.focus()}
							returnKeyType="next"
							submitBehavior="submit"
							testID="reset-password"
						/>
					)}
				</form.AppField>
				<form.AppField name="confirm">
					{field => (
						<field.PasswordField
							inputRef={confirmRef}
							label={t('modules.auth.confirmPassword')}
							onSubmitEditing={() => submitForm(form, loading)}
							returnKeyType="go"
							submitBehavior="submit"
							testID="reset-confirm"
						/>
					)}
				</form.AppField>
			</View>
			<View className="mt-auto">
				<form.AppForm>
					<form.SubmitButton label={t('modules.auth.resetPasswordButton')} loading={loading} testID="reset-submit" />
				</form.AppForm>
			</View>
		</AuthScreen>
	)
}
