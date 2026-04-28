import type { AnyFieldApi } from '@tanstack/form-core'
import { useTranslation } from 'react-i18next'
import { AuthEmailInput, AuthPasswordInput } from '@app/components/shared'

// Display error only after user has interacted (typed) OR a submit attempt has
// produced errors. Hides onMount errors so empty fields look clean on first paint.
function getDisplayedError(meta: AnyFieldApi['state']['meta'], t: (key: string) => string): string | undefined {
	const errors = meta.errors
	if (!errors?.length) return undefined
	const hasSubmitError = Boolean(meta.errorMap?.onSubmit)
	if (!meta.isDirty && !hasSubmitError) return undefined
	const e = errors[0]
	if (typeof e === 'string') return t(e)
	if (e && typeof e === 'object' && 'message' in e) {
		return t(String((e as { message: string }).message))
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
			errorMessage={getDisplayedError(field.state.meta, t)}
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
			errorMessage={getDisplayedError(field.state.meta, t)}
			label={label}
			onChangeText={field.handleChange}
			value={String(field.state.value ?? '')}
		/>
	)
}
