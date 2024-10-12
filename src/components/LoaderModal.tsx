import React from 'react'
import { LoaderScreen, Modal, ModalProps } from 'react-native-ui-lib'

const Placeholder = ({ ...props }: ModalProps) => {
	return (
		<Modal testID="loader-modal" transparent overlayBackgroundColor={'rgba(0,0,0,0.6)'} {...props}>
			<LoaderScreen />
		</Modal>
	)
}

export default Placeholder
