import React from 'react'
import { Colors, LoaderScreen, Modal, ModalProps } from 'react-native-ui-lib'

const Placeholder = ({ ...props }: ModalProps) => {
	return (
		<Modal overlayBackgroundColor={Colors.blackTransparent6} testID="loader-modal" transparent {...props}>
			<LoaderScreen />
		</Modal>
	)
}

export default Placeholder
