import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
	AuthEmailInput,
	AuthPasswordInput,
	CheckboxInput,
	SwitchInput,
	TextField as TextInputField,
	type TextFieldProps as TextInputFieldProps,
} from '@app/shared/ui'
import { getDisplayedError } from './fieldError'
import { useSubmitError } from './formBehavior'
import { useFieldContext } from './formHookContexts'

type TextLikeProps = Omit<TextInputFieldProps, 'value' | 'onChangeText' | 'onBlur' | 'errorMessage'>

function useTextFieldBindings() {
	const field = useFieldContext<string>()
	const { t } = useTranslation()
	const submitted = useStore(field.form.store, s => s.submissionAttempts > 0)
	const submitError = useSubmitError(field.form, error => (error?.field === field.name ? error.key : undefined))
	return {
		value: field.state.value ?? '',
		onChangeText: field.handleChange,
		onBlur: field.handleBlur,
		errorMessage: submitError ? t(submitError) : getDisplayedError(field.state.meta, t, submitted),
	}
}

/** `field.TextField`: plain text input bound to a string field. */
export function TextField(props: TextLikeProps) {
	return <TextInputField {...props} {...useTextFieldBindings()} />
}

/**
 * Text adapters take `inputRef`, `returnKeyType` and `onSubmitEditing` for the keyboard flow: "next"
 * focuses the following field's ref, the last field submits with `submitForm`. Set
 * `submitBehavior="submit"` on non-last fields so the keyboard stays up while focus moves.
 */

/** `field.EmailField`: email keyboard, autofill and autocapitalisation off. */
export function EmailField(props: TextLikeProps) {
	return <AuthEmailInput {...props} {...useTextFieldBindings()} />
}

/** `field.PasswordField`: secure entry with the show/hide toggle. */
export function PasswordField(props: TextLikeProps) {
	return <AuthPasswordInput {...props} {...useTextFieldBindings()} />
}

/** `field.CheckboxField`: boolean field. */
export function CheckboxField({ label, testID }: { label: string; testID?: string }) {
	const field = useFieldContext<boolean>()
	return <CheckboxInput label={label} onValueChange={field.handleChange} testID={testID} value={field.state.value} />
}

/** `field.SwitchField`: boolean field. */
export function SwitchField({ label, testID }: { label: string; testID?: string }) {
	const field = useFieldContext<boolean>()
	return <SwitchInput label={label} onValueChange={field.handleChange} testID={testID} value={field.state.value} />
}
