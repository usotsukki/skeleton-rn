import * as Updates from 'expo-updates'
import { useEffect } from 'react'

const useUpdates = () => {
	const onFetchUpdateAsync = async () => {
		if (__DEV__) return
		try {
			const update = await Updates.checkForUpdateAsync()

			if (update.isAvailable) {
				await Updates.fetchUpdateAsync()
				await Updates.reloadAsync()
			}
		} catch (error) {
			console.error('EXPO_UPDATE_ERROR: ', error)
		}
	}

	useEffect(() => {
		onFetchUpdateAsync()
	}, [])
}

export default useUpdates
