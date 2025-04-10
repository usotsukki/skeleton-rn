import React from 'react'
import { Incubator, ToastPresets } from 'react-native-ui-lib'
import useToast from '@app/hooks/useToast'

const Toast = () => {
	const { message, visible, style, duration, hideToast } = useToast()

	const preset = {
		success: ToastPresets.SUCCESS,
		error: ToastPresets.FAILURE,
		info: ToastPresets.GENERAL,
	}[style]

	return (
		<Incubator.Toast
			position="top"
			zIndex={6}
			autoDismiss={duration}
			message={message}
			onDismiss={hideToast}
			preset={preset}
			swipeable
			testID="toast-netinfo"
			visible={visible}
		/>
	)
}

export default Toast
