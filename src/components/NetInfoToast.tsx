import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Incubator } from 'react-native-ui-lib'
import { useConnectionStatus } from '@app/hooks'

const NetInfoToast = () => {
	const { t } = useTranslation('translation', { keyPrefix: 'info' })
	const [visible, setVisible] = useState(false)

	const internetConnection = useConnectionStatus()

	useEffect(() => {
		if (!internetConnection) {
			setVisible(true)
		}
		if (internetConnection) {
			setVisible(false)
		}
	}, [internetConnection])

	return (
		<Incubator.Toast
			testID="toast-netinfo"
			zIndex={5}
			backgroundColor="rgba(0,0,0,0.9)"
			message={t('offline')}
			centerMessage
			messageStyle={styles.message}
			icon={require('@assets/png/offline.png')}
			visible={visible}
			swipeable
			position={'top'}
		/>
	)
}

const styles = StyleSheet.create({
	message: { color: 'white' },
})

export default NetInfoToast
