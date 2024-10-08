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
			testID="toast-netinfo"
			visible={visible}
			swipeable
			position="top"
			onDismiss={() => setVisible(false)}
			message={message}
			icon={require('@assets/png/offline.png')}
			zIndex={5}
		/>
	)
}

export default NetInfoToast
