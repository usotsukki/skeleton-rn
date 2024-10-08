import * as NetInfo from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'
import { logger } from '@app/utils'

const useConnectionStatus = () => {
	const [hasInternetConnection, setHasInternetConnection] = useState(true)

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
			setHasInternetConnection(updateStateAction)
		}
	}

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(onChange)
		return unsubscribe
	}, [])

	return hasInternetConnection
}

export default useConnectionStatus
