import React, { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Colors, View } from 'react-native-ui-lib'

type ProgressBarProps = {
	progress: number // 0 to 1
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
	const width = useSharedValue(0)

	useEffect(() => {
		width.value = withTiming(progress * 100, { duration: 300 })
	}, [progress])

	const style = useAnimatedStyle(() => {
		return {
			width: `${width.value}%`,
		}
	})

	return (
		<View width="100%" height={6} backgroundColor={Colors.whiteTransparent2} br40 style={{ overflow: 'hidden' }}>
			<Animated.View style={[{ height: '100%', backgroundColor: Colors.primary }, style]} />
		</View>
	)
}
