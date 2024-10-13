import React from 'react'
import { Incubator, ToastPresets } from 'react-native-ui-lib'
import { useStore } from '@app/store'

const Toast = () => {
	const message = useStore(state => state.toast.message)
	const visible = useStore(state => state.toast.visible)
	const style = useStore(state => state.toast.style)
	const duration = useStore(state => state.toast.duration)
	const hideToast = useStore(state => state.hideToast)

	const preset = {
		success: ToastPresets.SUCCESS,
		error: ToastPresets.FAILURE,
		info: ToastPresets.GENERAL,
	}[style]

	return (
		<Incubator.Toast
			testID="toast-netinfo"
			visible={visible}
			swipeable
			position="top"
			preset={preset}
			message={message}
			onDismiss={hideToast}
			autoDismiss={duration}
			zIndex={6}
		/>
	)
}

export default Toast
