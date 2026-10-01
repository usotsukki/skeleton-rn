import type { AnyFieldMeta } from '@tanstack/react-form'
import type { TFunction } from 'i18next'

/**
 * The error to show under a field. Validators run on every change; the error shows once the user
 * typed into the field and left it (then live, so it clears as soon as the input is fixed) or after
 * a submit attempt. A fresh field being typed into or only focused stays quiet. Validators return
 * i18n keys (strings or Standard Schema issues with a `message` key).
 */
export function getDisplayedError(meta: AnyFieldMeta, t: TFunction, submitted: boolean): string | undefined {
	const errors = meta.errors
	if (!errors?.length) return undefined
	if (!submitted && !(meta.isBlurred && meta.isDirty)) return undefined
	const e: unknown = errors[0]
	if (typeof e === 'string') return t(e)
	if (e && typeof e === 'object' && 'message' in e) return t(String(e.message))
	return undefined
}
