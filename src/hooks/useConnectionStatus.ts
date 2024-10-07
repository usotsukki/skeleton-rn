import * as NetInfo from '@react-native-community/netinfo'
import { isNil } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { logger } from '@app/utils'

const useConnectionStatus = () => {
	const [isConnected, setIsConnected] = useState(true)

	const onChange: NetInfo.NetInfoChangeHandler = useCallback(
		({ isInternetReachable }) => {
			if (!isNil(isInternetReachable)) {
				setIsConnected(isInternetReachable)
				if (!isConnected && isInternetReachable) {
					logger.info('Internet connection restored')
				} else if (!isInternetReachable) {
					logger.info('Internet connection lost, entering offline mode')
				}
			}
		},
		[isConnected],
	)

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(onChange)
		return unsubscribe
	}, [onChange])

	return isConnected
}

export default useConnectionStatus
