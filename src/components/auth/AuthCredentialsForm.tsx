import { useForm } from '@tanstack/react-form'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { AppText, AuthOAuthFooter, CheckboxInput, FormSubmitFooter } from '@app/components/shared'
import { useAuthStore } from '@app/hooks/useAuth'
import { authCredentialsFormOpts } from '@app/utils/validators'
import { AuthFormEmailField, AuthFormPasswordField } from './AuthCredentialFields'

interface AuthCredentialsFormProps {
	title: string
	subtitle: string
	submitLabel: string
	loading: boolean
	onSubmit: (creds: { email: string; password: string }) => void
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

	const form = useForm({
		...authCredentialsFormOpts,
		onSubmit: ({ value }) => onSubmit({ email: value.email, password: value.password }),
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
				<form.Field name="email">
					{field => <AuthFormEmailField field={field} label={t('modules.auth.email')} />}
				</form.Field>
				<form.Field name="password">
					{field => <AuthFormPasswordField field={field} label={t('modules.auth.password')} />}
				</form.Field>

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

			<form.Subscribe selector={state => state.canSubmit}>
				{canSubmit => (
					<FormSubmitFooter
						disabled={!canSubmit || loading}
						label={submitLabel}
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
					actionLabel={actionLabel}
					onAction={onActionPress}
					onApple={onApple}
					onGoogle={onGoogle}
					promptText={promptText}
				/>
			</View>
		</>
	)
}
