import * as Haptics from 'expo-haptics'
import { useCallback } from 'react'

const useHaptics = () => {
	const triggerImpact = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
		Haptics.impactAsync(style)
	}, [])

	const triggerNotification = useCallback(
		(type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
			Haptics.notificationAsync(type)
		},
		[],
	)

	const triggerSelection = useCallback(() => {
		Haptics.selectionAsync()
	}, [])

	return {
		triggerImpact,
		triggerNotification,
		triggerSelection,
	}
}

export default useHaptics
