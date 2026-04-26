import React from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { colors } from '@app/theme/colors'
import { useSkeletonPulse } from './SkeletonPulseProvider'

const OPACITY_LOW = 0.4
const OPACITY_HIGH = 1

interface SkeletonPulseProps {
	className?: string
	style?: StyleProp<ViewStyle>
}

export default function SkeletonPulse({ className, style }: SkeletonPulseProps) {
	const progress = useSkeletonPulse()

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 1], [OPACITY_LOW, OPACITY_HIGH]),
		backgroundColor: colors['skeleton'],
	}))

	return <Animated.View className={className} style={[animatedStyle, style]} />
}
