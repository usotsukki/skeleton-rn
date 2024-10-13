import React from 'react'
import { Colors, LoaderScreen, Modal, ModalProps } from 'react-native-ui-lib'

const Placeholder = ({ ...props }: ModalProps) => {
	return (
		<Modal testID="loader-modal" transparent overlayBackgroundColor={Colors.blackTransparent6} {...props}>
			<LoaderScreen />
		</Modal>
	)
}

export default Placeholder
