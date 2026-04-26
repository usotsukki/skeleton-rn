/**
 * Centralized toast durations (ms).
 */
export const TOAST_DURATION = {
	success: 3000,
	info: 3000,
	error: 10000,
	errorShort: 6000,
	undo: 2500,
	actionDefault: 5000,
	persistent: -1,
} as const

export type ToastDurationKey = keyof typeof TOAST_DURATION
