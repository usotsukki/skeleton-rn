import React from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { useThemeColors } from '@app/shared/theme/colors'
import { useSkeletonPulse } from './SkeletonPulseProvider'

const OPACITY_LOW = 0.4
const OPACITY_HIGH = 1

interface SkeletonPulseProps {
	className?: string
	style?: StyleProp<ViewStyle>
}

export default function SkeletonPulse({ className, style }: SkeletonPulseProps) {
	const progress = useSkeletonPulse()
	// Read on the JS thread; the worklet captures the resolved value.
	const skeletonColor = useThemeColors().skeleton

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [OPACITY_LOW, OPACITY_HIGH]),
		backgroundColor: skeletonColor,
	}))

	return <Animated.View className={className} style={[animatedStyle, style]} />
}
