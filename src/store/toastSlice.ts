import { createSliceWithImmer } from '@app/utils/store/createSliceWithImmer'

export interface ToastSliceState {
	visible: boolean
	message: string
	style: 'success' | 'error' | 'info'
	duration: number
}

export interface ToastSliceActions {
	showToast: (message: string, style?: 'success' | 'error' | 'info', duration?: number) => void
	hideToast: () => void
}

const toastSlice = createSliceWithImmer({
	name: 'toast',
	value: {
		visible: false,
		message: '',
		style: 'success',
	} as ToastSliceState,
	actions: {
		showToast: (message: string, style?: 'success' | 'error' | 'info', duration?: number) => state => {
			state.visible = true
			state.message = message
			state.style = style || 'success'
			state.duration = duration || 3000
		},
		hideToast: () => state => {
			state.visible = false
		},
	},
})

export default toastSlice
