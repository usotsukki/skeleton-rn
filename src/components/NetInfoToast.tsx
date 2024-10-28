import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Incubator } from 'react-native-ui-lib'
import { useConnectionStatus } from '@app/hooks'

const NetInfoToast = () => {
	const { t } = useTranslation('translation', { keyPrefix: 'info' })
	const message = useMemo(() => t('offline'), [t])
	const [visible, setVisible] = useState(false)

	const internetConnection = useConnectionStatus()

	useEffect(() => {
		setVisible(!internetConnection)
	}, [internetConnection])

	return (
		<Incubator.Toast
			position="top"
			zIndex={5}
			icon={require('@assets/png/offline.png')}
			message={message}
			onDismiss={() => setVisible(false)}
			swipeable
			testID="toast-netinfo"
			visible={visible}
		/>
	)
}

export default NetInfoToast
