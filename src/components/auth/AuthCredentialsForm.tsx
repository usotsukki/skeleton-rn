import { type ReactNode, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type TextInput, View } from 'react-native'
import { getAuthFormError } from '@app/api/auth'
import { focusFirstInvalid, setSubmitError, submitForm, useAppForm } from '@app/components/form'
import { AppText, AuthOAuthFooter, CheckboxInput } from '@app/components/shared'
import { useAuthStore } from '@app/hooks/useAuth'
import { authCredentialsFormOpts, authCredentialsSchema } from '@app/utils/validators'

interface AuthCredentialsFormProps {
	title: string
	subtitle: string
	submitLabel: string
	/** Any auth request is running (disables every action). */
	loading: boolean
	/** The email/password request is running (spinner on submit). */
	submitting?: boolean
	/** An OAuth request is running (spinner on that provider). */
	oauthLoading?: 'apple' | 'google'
	/** The request; the spinner stays up until it settles, and a rejection is shown in the form. */
	onSubmit: (creds: { email: string; password: string }) => Promise<unknown>
	onGoogle: () => void
	onApple: () => void
	promptText: string
	actionLabel: string
	onActionPress: () => void
	inlineFieldsAccessory?: ReactNode
}

export function AuthCredentialsForm({
	title,
	subtitle,
	submitLabel,
	loading,
	submitting,
	oauthLoading,
	onSubmit,
	onGoogle,
	onApple,
	promptText,
	actionLabel,
	onActionPress,
	inlineFieldsAccessory,
}: AuthCredentialsFormProps) {
	const { t } = useTranslation()
	const staySignedIn = useAuthStore(s => s.staySignedIn)
	const setStaySignedIn = useAuthStore(s => s.setStaySignedIn)

	const emailRef = useRef<TextInput>(null)
	const passwordRef = useRef<TextInput>(null)

	const fieldRefs = [
		['email', emailRef],
		['password', passwordRef],
	] as const

	const form = useAppForm({
		...authCredentialsFormOpts,
		onSubmit: async ({ value, formApi }) => {
			try {
				// Parse so the request gets the trimmed email.
				await onSubmit(authCredentialsSchema.parse(value))
			} catch (error) {
				const submitError = getAuthFormError(error)
				if (!submitError) return
				setSubmitError(formApi, submitError)
				focusFirstInvalid(formApi, fieldRefs)
			}
		},
		onSubmitInvalid: ({ formApi }) => focusFirstInvalid(formApi, fieldRefs),
	})

	return (
		<>
			<View className="mb-8 gap-2">
				<AppText variant="disp">{title}</AppText>
				<AppText className="text-text-secondary" variant="tm">
					{subtitle}
				</AppText>
			</View>

			<View className="gap-4">
				<form.AppField name="email">
					{field => (
						<field.EmailField
							inputRef={emailRef}
							label={t('modules.auth.email')}
							onSubmitEditing={() => passwordRef.current?.focus()}
							returnKeyType="next"
							submitBehavior="submit"
							testID="auth-email"
						/>
					)}
				</form.AppField>
				<form.AppField name="password">
					{field => (
						<field.PasswordField
							inputRef={passwordRef}
							label={t('modules.auth.password')}
							onSubmitEditing={() => submitForm(form, loading)}
							returnKeyType="go"
							submitBehavior="submit"
							testID="auth-password"
						/>
					)}
				</form.AppField>

				{inlineFieldsAccessory ? (
					<View className="flex-row items-center justify-between">
						<CheckboxInput
							label={t('modules.auth.staySignedIn')}
							onValueChange={setStaySignedIn}
							value={staySignedIn}
						/>
						{inlineFieldsAccessory}
					</View>
				) : (
					<CheckboxInput label={t('modules.auth.staySignedIn')} onValueChange={setStaySignedIn} value={staySignedIn} />
				)}
			</View>

			<form.AppForm>
				<form.SubmitButton
					disabled={loading && !submitting}
					label={submitLabel}
					loading={submitting}
					testID="auth-submit"
				/>
			</form.AppForm>

			<View className="mt-8">
				<AuthOAuthFooter
					actionLabel={actionLabel}
					disabled={loading}
					loadingProvider={oauthLoading}
					onAction={onActionPress}
					onApple={onApple}
					onGoogle={onGoogle}
					promptText={promptText}
				/>
			</View>
		</>
	)
}
