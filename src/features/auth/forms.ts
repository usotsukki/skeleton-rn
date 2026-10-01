import { formOptions } from '@tanstack/react-form'
import { z } from 'zod'
import { emailSchema, passwordSchema } from '@app/shared/utils/validators'

/**
 * i18n message **keys** (not `t()` output) so the schema is stable. Translate at render with `t(key)`.
 */
export const authCredentialsSchema = z.object({ email: emailSchema, password: passwordSchema })

export type AuthCredentialsFormValues = z.infer<typeof authCredentialsSchema>

/**
 * Defaults + validator for sign-in / sign-up `useAppForm({ ...authCredentialsFormOpts, onSubmit })`.
 * Errors show after a field was left or on submit (`getDisplayedError`); submit is always allowed.
 */
export const authCredentialsFormOpts = formOptions({
	defaultValues: { email: '', password: '' } satisfies AuthCredentialsFormValues,
	validators: { onChange: authCredentialsSchema },
})

export const forgotPasswordSchema = z.object({ email: emailSchema })

export const forgotPasswordFormOpts = formOptions({
	defaultValues: { email: '' },
	validators: { onChange: forgotPasswordSchema },
})

export const resetPasswordSchema = z
	.object({ password: passwordSchema, confirm: z.string().min(1, 'error.required') })
	.refine(v => v.password === v.confirm, {
		path: ['confirm'],
		message: 'error.passwordsDoNotMatch',
		// Report a mismatch even while the password itself is still too short.
		when: ({ value }) => typeof value === 'object' && value !== null && 'confirm' in value && !!value.confirm,
	})

export const resetPasswordFormOpts = formOptions({
	defaultValues: { password: '', confirm: '' },
	validators: { onChange: resetPasswordSchema },
})
