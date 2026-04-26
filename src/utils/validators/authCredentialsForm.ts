import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'

/**
 * i18n message **keys** (not `t()` output) so the schema is stable — same pattern as tailtime
 * `jobFormSchema` + `formOptions` (see `../tailtime` job-form). Translate at render with `t(key)`.
 */
export const authCredentialsSchema = z.object({
	email: z.string().trim().min(1, 'error.required').email('error.wrongEmailFormat'),
	password: z.string().min(6, 'error.shortPassword'),
})

export type AuthCredentialsFormValues = z.infer<typeof authCredentialsSchema>

/** Shared defaults + Standard Schema validators for sign-in / sign-up `useForm({ ...authCredentialsFormOpts, onSubmit })`. */
export const authCredentialsFormOpts = formOptions({
	defaultValues: {
		email: '',
		password: '',
	} satisfies AuthCredentialsFormValues,
	validators: {
		onMount: authCredentialsSchema,
		onChange: authCredentialsSchema,
		onSubmit: authCredentialsSchema,
	},
})
