import { createFormHook } from '@tanstack/react-form'
import { CheckboxField, EmailField, PasswordField, SwitchField, TextField } from './fields'
import { APP_FORM_DEFAULTS } from './formBehavior'
import { fieldContext, formContext } from './formHookContexts'
import { SubmitButton } from './SubmitButton'

const appForm = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: { TextField, EmailField, PasswordField, CheckboxField, SwitchField },
	formComponents: { SubmitButton },
})

/**
 * App-wide TanStack Form hook with `APP_FORM_DEFAULTS` (submit always enabled; put the schema in
 * `validators.onChange`, errors show per `getDisplayedError`). Render fields with
 * `<form.AppField name="…">{f => <f.TextField … />}` and the submit button inside
 * `<form.AppForm><form.SubmitButton … /></form.AppForm>`. Add new field adapters to `fields.tsx`
 * and register them above.
 */
export const useAppForm = (props =>
	appForm.useAppForm({
		...APP_FORM_DEFAULTS,
		...props,
		// A form's own onChange/onSubmit listeners run after the defaults instead of replacing them.
		listeners: {
			...props.listeners,
			onChange: event => {
				APP_FORM_DEFAULTS.listeners.onChange(event)
				props.listeners?.onChange?.(event)
			},
			onSubmit: event => {
				APP_FORM_DEFAULTS.listeners.onSubmit()
				props.listeners?.onSubmit?.(event)
			},
		},
	})) as typeof appForm.useAppForm

export const { withForm } = appForm
