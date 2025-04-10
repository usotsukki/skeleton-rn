import { create } from 'zustand'

interface ToastStore {
	visible: boolean
	message: string
	style: 'success' | 'error' | 'info'
	duration: number
	showToast: (message: string, style?: 'success' | 'error' | 'info', duration?: number) => void
	hideToast: () => void
}

const useToast = create<ToastStore>(set => ({
	message: '',
	visible: false,
	style: 'success',
	duration: 3000,
	showToast: (message: string, style?: 'success' | 'error' | 'info', duration?: number) =>
		set({
			visible: true,
			message,
			style: style || 'success',
			duration: duration || 3000,
		}),
	hideToast: () => set({ visible: false }),
}))

export default useToast
