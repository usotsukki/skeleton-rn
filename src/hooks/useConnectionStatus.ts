import * as NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'
import { logger } from '@app/utils'

interface ConnectionStore {
	hasInternetConnection: boolean
	setConnectionStatus: (status: boolean) => void
}

const useConnectionStore = create<ConnectionStore>(set => ({
	hasInternetConnection: true,
	setConnectionStatus: (status: boolean) => set({ hasInternetConnection: status }),
}))

const useConnectionStatus = () => {
	const { hasInternetConnection, setConnectionStatus } = useConnectionStore()

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
