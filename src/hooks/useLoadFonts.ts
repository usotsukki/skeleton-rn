import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import { logger } from '@app/utils'

const useLoadFonts = () => {
	const [fontsReady, error] = useFonts({
		'SF-Pro-Rounded-Black': require('../../assets/fonts/SF-Pro-Rounded-Black.otf'),
		'SF-Pro-Rounded-Bold': require('../../assets/fonts/SF-Pro-Rounded-Bold.otf'),
		'SF-Pro-Rounded-Heavy': require('../../assets/fonts/SF-Pro-Rounded-Heavy.otf'),
		'SF-Pro-Rounded-Medium': require('../../assets/fonts/SF-Pro-Rounded-Medium.otf'),
		'SF-Pro-Rounded-Regular': require('../../assets/fonts/SF-Pro-Rounded-Regular.otf'),
		'SF-Pro-Rounded-Semibold': require('../../assets/fonts/SF-Pro-Rounded-Semibold.otf'),
		'SF-Mono-Bold': require('../../assets/fonts/SF-Mono-Bold.otf'),
		'SF-Mono-Semibold': require('../../assets/fonts/SF-Mono-Semibold.otf'),
	})

	useEffect(() => {
		if (error) {
			logger.error(error)
		}
	}, [error])

	return { fontsReady, error, fontsFinishedLoading: fontsReady || !!error }
}

export default useLoadFonts
