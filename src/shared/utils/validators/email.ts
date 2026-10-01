import { z } from 'zod'

/** Zod schema for an email field. Empty → required; otherwise must be a valid address. */
export const emailSchema = z
	.string()
	.trim()
	.min(1, { error: 'error.required', abort: true })
	.email('error.wrongEmailFormat')

/** True when value is a syntactically valid email. */
export function isValidEmail(value: string): boolean {
	return emailSchema.safeParse(value).success
}
