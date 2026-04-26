import type { AnyFieldApi } from '@tanstack/form-core'
import { useTranslation } from 'react-i18next'
import { AuthEmailInput, AuthPasswordInput } from '@app/components/shared'

function translatedFirstError(errors: unknown[] | undefined, t: (key: string) => string): string | undefined {
	if (!errors?.length) return undefined
	const e = errors[0]
	if (typeof e === 'string') return t(e)
	if (e && typeof e === 'object' && 'message' in e) {
		const m = String((e as { message: string }).message)
		return t(m)
	}
	return undefined
}

type EmailFieldProps = {
	field: AnyFieldApi
	label: string
}

/** Tailtime-style: `field.handleChange` + `field.state.value` + `field.state.meta.errors` (no per-field `useStore`). */
export function AuthFormEmailField({ field, label }: EmailFieldProps) {
	const { t } = useTranslation()
	return (
		<AuthEmailInput
			errorMessage={translatedFirstError(field.state.meta.errors, t)}
			label={label}
			onChangeText={field.handleChange}
			value={String(field.state.value ?? '')}
		/>
	)
}

type PasswordFieldProps = {
	field: AnyFieldApi
	label: string
}

export function AuthFormPasswordField({ field, label }: PasswordFieldProps) {
	const { t } = useTranslation()
	return (
		<AuthPasswordInput
			errorMessage={translatedFirstError(field.state.meta.errors, t)}
			label={label}
			onChangeText={field.handleChange}
			value={String(field.state.value ?? '')}
		/>
	)
}
