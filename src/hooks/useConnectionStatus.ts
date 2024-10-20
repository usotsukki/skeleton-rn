import * as NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useStore } from '@app/store'
import { logger } from '@app/utils'

const useConnectionStatus = () => {
	const hasInternetConnection = useStore(state => state.connection.hasInternetConnection)
	const setConnectionStatus = useStore(state => state.setConnectionStatus)

	const onChange: NetInfo.NetInfoChangeHandler = ({ isInternetReachable }) => {
		if (isInternetReachable != null) {
			const updateStateAction = (prevState: boolean) => {
				if (prevState !== isInternetReachable) {
					logger.info(
						isInternetReachable ? 'Internet connection restored' : 'Internet connection lost, entering offline mode',
					)
				}
				return isInternetReachable
			}
			setConnectionStatus(updateStateAction(hasInternetConnection))

			onlineManager.setOnline(isInternetReachable)
		}
	}

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(onChange)
		return unsubscribe
	}, [])

	return hasInternetConnection
}

export default useConnectionStatus
