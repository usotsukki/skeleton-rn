import type { ReactNode } from 'react'
import { create } from 'zustand'
import { TOAST_DURATION } from './toastDurations'

export type ToastStyle = 'success' | 'error' | 'info'
export type ToastVariant = 'simple' | 'action'

export interface ToastAction {
	label: string
	onPress: () => void | Promise<void>
	variant?: 'primary' | 'secondary' | 'ghost'
	icon?: ReactNode
	keepOpen?: boolean
}

export interface ToastItem {
	id: string
	message: string
	style: ToastStyle
	duration: number
	isDismissable?: boolean
	variant?: ToastVariant
	title?: string
	actions?: ToastAction[]
	showProgress?: boolean
	onBodyPress?: () => void
	bodyPressKeepOpen?: boolean
}

export interface ShowActionToastParams {
	message: string
	title?: string
	style?: ToastStyle
	/** Default `TOAST_DURATION.actionDefault` (5000) for action toasts. */
	duration?: number
	isDismissable?: boolean
	actions: ToastAction[]
	replaceId?: string
	showProgress?: boolean
	onBodyPress?: () => void
	bodyPressKeepOpen?: boolean
}

interface ToastStore {
	toasts: ToastItem[]
	showToast: (message: string, style?: ToastStyle, duration?: number, isDismissable?: boolean) => string
	showActionToast: (params: ShowActionToastParams) => string
	updateToast: (id: string, patch: Partial<Omit<ToastItem, 'id'>>) => void
	hideToast: (id: string) => void
}

let toastId = 0

const useToast = create<ToastStore>(set => ({
	toasts: [],
	showToast: (message: string, style?: ToastStyle, duration?: number, isDismissable?: boolean) => {
		const newId = `toast-${++toastId}`
		const resolvedStyle = style ?? 'success'
		set(state => ({
			toasts: [
				...state.toasts,
				{
					id: newId,
					message,
					style: resolvedStyle,
					duration: duration ?? TOAST_DURATION[resolvedStyle],
					isDismissable,
					variant: 'simple',
				},
			],
		}))
		return newId
	},
	showActionToast: ({
		message,
		title,
		style,
		duration,
		isDismissable,
		actions,
		replaceId,
		showProgress,
		onBodyPress,
		bodyPressKeepOpen,
	}: ShowActionToastParams) => {
		const useId = replaceId ?? `toast-${++toastId}`
		const item: ToastItem = {
			id: useId,
			message,
			title,
			style: style ?? 'success',
			duration: duration ?? TOAST_DURATION.actionDefault,
			isDismissable,
			variant: 'action',
			actions,
			showProgress,
			onBodyPress,
			bodyPressKeepOpen,
		}
		set(state => {
			const idx = replaceId ? state.toasts.findIndex(t => t.id === replaceId) : -1
			if (idx >= 0) {
				const next = state.toasts.slice()
				next[idx] = item
				return { toasts: next }
			}
			return { toasts: [...state.toasts, item] }
		})
		return useId
	},
	updateToast: (id, patch) =>
		set(state => {
			const idx = state.toasts.findIndex(t => t.id === id)
			if (idx < 0) return state
			const next = state.toasts.slice()
			next[idx] = { ...next[idx]!, ...patch }
			return { toasts: next }
		}),
	hideToast: (id: string) =>
		set(state => ({
			toasts: state.toasts.filter(t => t.id !== id),
		})),
}))

export default useToast
