import { create } from 'zustand'
import { TOAST_DURATION } from './toastDurations'

export type ToastStyle = 'success' | 'error' | 'info'

export interface ToastItem {
	id: string
	message: string
	style: ToastStyle
	duration: number
	isDismissable?: boolean
}

interface ToastStore {
	toasts: ToastItem[]
	showToast: (message: string, style?: ToastStyle, duration?: number, isDismissable?: boolean) => string
	hideToast: (id: string) => void
}

let toastId = 0

const useToast = create<ToastStore>(set => ({
	toasts: [],
	showToast: (message, style, duration, isDismissable) => {
		const id = `toast-${++toastId}`
		const resolvedStyle = style ?? 'success'
		set(state => ({
			toasts: [
				...state.toasts,
				{
					id,
					message,
					style: resolvedStyle,
					duration: duration ?? TOAST_DURATION[resolvedStyle],
					isDismissable,
				},
			],
		}))
		return id
	},
	hideToast: (id: string) =>
		set(state => ({
			toasts: state.toasts.filter(t => t.id !== id),
		})),
}))

export default useToast
