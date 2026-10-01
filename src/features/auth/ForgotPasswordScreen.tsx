import { useRouter } from 'expo-router'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type TextInput, View } from 'react-native'
import { focusFirstInvalid, setSubmitError, submitForm, useAppForm } from '@app/shared/form'
import useToast from '@app/shared/hooks/useToast'
import { AppText } from '@app/shared/ui'
import { getAuthFormError } from './api'
import { AuthScreen } from './components'
import { forgotPasswordFormOpts, forgotPasswordSchema } from './forms'
import useAuth from './hooks/useAuth'

export default function ForgotPassword() {
	const { t } = useTranslation()
	const router = useRouter()
	const showToast = useToast(s => s.showToast)
	const { sendPasswordResetEmailAsync, loading } = useAuth()
	const emailRef = useRef<TextInput>(null)
	const fieldRefs = [['email', emailRef]] as const

	const form = useAppForm({
		...forgotPasswordFormOpts,
		onSubmit: async ({ value, formApi }) => {
			try {
				await sendPasswordResetEmailAsync(forgotPasswordSchema.parse(value))
			} catch (error) {
				const submitError = getAuthFormError(error)
				if (!submitError) return
				setSubmitError(formApi, submitError)
				focusFirstInvalid(formApi, fieldRefs)
				return
			}
			showToast(t('modules.auth.resetEmailSent'), 'success')
			router.back()
		},
		onSubmitInvalid: ({ formApi }) => focusFirstInvalid(formApi, fieldRefs),
	})

	return (
		<AuthScreen
			paddingTop={64}
			headerLeading={{ kind: 'back', onPress: router.back, a11yLabel: t('modules.common.close') }}
			headerTitle={t('modules.auth.forgotPasswordTitle')}>
			<AppText className="mb-6 text-text-secondary" variant="tm">
				{t('modules.auth.forgotPasswordSubtitle')}
			</AppText>
			<form.AppField name="email">
				{field => (
					<field.EmailField
						inputRef={emailRef}
						label={t('modules.auth.email')}
						onSubmitEditing={() => submitForm(form, loading)}
						returnKeyType="send"
						submitBehavior="submit"
						testID="forgot-email"
					/>
				)}
			</form.AppField>
			<View className="mt-auto">
				<form.AppForm>
					<form.SubmitButton label={t('modules.auth.sendResetEmail')} loading={loading} testID="forgot-submit" />
				</form.AppForm>
			</View>
		</AuthScreen>
	)
}
