import { useTranslation } from 'react-i18next'
import { FormSubmitFooter } from '@app/components/shared'
import { submitForm, useSubmitError } from './formBehavior'
import { useFormContext } from './formHookContexts'

interface SubmitButtonProps {
	label: string
	/** Extra busy state from outside the form (e.g. a mutation's `isPending`). */
	loading?: boolean
	/** Extra disabled state from outside the form (e.g. another auth request running). */
	disabled?: boolean
	testID?: string
}

/**
 * `form.SubmitButton` (inside `<form.AppForm>`): spinner while submitting or `loading`, and the
 * form-level `setSubmitError` message above it. With the app defaults (`canSubmitWhenInvalid`) it
 * stays enabled; a form that opts out is disabled until valid.
 */
export function SubmitButton({ label, loading, disabled, testID }: SubmitButtonProps) {
	const form = useFormContext()
	const { t } = useTranslation()
	const formError = useSubmitError(form, error => (error && !error.field ? error.key : undefined))
	return (
		<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
			{([canSubmit, isSubmitting]) => (
				<FormSubmitFooter
					disabled={!canSubmit || !!disabled}
					errorMessage={formError ? t(formError) : undefined}
					label={label}
					loading={isSubmitting || !!loading}
					onPress={() => submitForm(form)}
					submitTestID={testID}
				/>
			)}
		</form.Subscribe>
	)
}
