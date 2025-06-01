import * as Notifications from 'expo-notifications'
import { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { EAS_PROJECT_ID } from '@app/env'

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

const registerForPushNotificationsAsync = async (): Promise<string | null> => {
	try {
		const { status: existingStatus } = await Notifications.getPermissionsAsync()
		let finalStatus = existingStatus

		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync()
			finalStatus = status
		}

		if (finalStatus !== 'granted') {
			Alert.alert('Failed to get push token for push notification!')
			return null
		}

		const projectId = EAS_PROJECT_ID
		if (!projectId) {
			throw new Error('Project ID not found')
		}

		const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
		return token
	} catch (e) {
		console.error('Error getting push token:', e)
		return null
	}
}

const useNotifications = () => {
	const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
	const [notification, setNotification] = useState<Notifications.Notification | null>(null)
	const notificationListener = useRef<Notifications.EventSubscription | null>(null)
	const responseListener = useRef<Notifications.EventSubscription | null>(null)

	const registerPushToken = async () => {
		const token = await registerForPushNotificationsAsync()
		if (token) {
			setExpoPushToken(token)
		}
	}

	useEffect(() => {
		registerPushToken()

		notificationListener.current = Notifications.addNotificationReceivedListener(n => setNotification(n))
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
			console.log('User interacted with notification:', response)
		})

		return () => {
			if (notificationListener.current) {
				notificationListener.current.remove()
			}
			if (responseListener.current) {
				responseListener.current.remove()
			}
		}
	}, [])

	return {
		notification,
		token: expoPushToken,
	}
}

export default useNotifications
