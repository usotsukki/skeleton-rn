import { z } from 'zod'

/** Zod schema for a password field. Empty → required; minimum 6 characters per Supabase default policy. */
export const passwordSchema = z.string().min(1, { error: 'error.required', abort: true }).min(6, 'error.shortPassword')

export function isValidPassword(value: string): boolean {
	return passwordSchema.safeParse(value).success
}
