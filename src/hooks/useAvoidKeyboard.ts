import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { AvoidSoftInput } from 'react-native-avoid-softinput'

/**
 * Has to be used with scrollable components
 */
const useAvoidKeyboard = () => {
	const onFocusEffect = useCallback(() => {
		AvoidSoftInput.setShouldMimicIOSBehavior(true)
		AvoidSoftInput.setEnabled(true)
		return () => {
			AvoidSoftInput.setEnabled(false)
			AvoidSoftInput.setShouldMimicIOSBehavior(false)
		}
	}, [])

	useFocusEffect(onFocusEffect)
}

export default useAvoidKeyboard
