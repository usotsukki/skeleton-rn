import { z } from 'zod'

/** Zod schema for an email field. Rejects empty + malformed addresses. */
export const emailSchema = z.string().trim().min(1, 'error.required').email('error.wrongEmailFormat')

/** True when value is a syntactically valid email. */
export function isValidEmail(value: string): boolean {
	return emailSchema.safeParse(value).success
}
