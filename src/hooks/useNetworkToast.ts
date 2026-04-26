import NetInfo from '@react-native-community/netinfo'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TOAST_DURATION } from './toastDurations'
import useToast from './useToast'

export default function useNetworkToast() {
	const { t } = useTranslation()
	const showToast = useToast(s => s.showToast)
	const hideToast = useToast(s => s.hideToast)
	const toastIdRef = useRef<string | null>(null)

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			const isOffline = state.isConnected === false

			if (isOffline) {
				if (!toastIdRef.current) {
					toastIdRef.current = showToast(t('info.offline'), 'error', TOAST_DURATION.persistent, false)
				}
			} else {
				if (toastIdRef.current) {
					hideToast(toastIdRef.current)
					toastIdRef.current = null
				}
			}
		})

		return () => {
			unsubscribe()
			if (toastIdRef.current) {
				hideToast(toastIdRef.current)
				toastIdRef.current = null
			}
		}
	}, [showToast, hideToast, t])
}
