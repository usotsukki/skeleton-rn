import { z } from 'zod'

/** Zod schema for a password field. Minimum 6 characters per Supabase default policy. */
export const passwordSchema = z.string().min(6, 'error.shortPassword')

export function isValidPassword(value: string): boolean {
	return passwordSchema.safeParse(value).success
}
