import { AppText } from '@shared'
import React from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, SharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Colors } from 'react-native-ui-lib'

const { width } = Dimensions.get('window')
const SWIPE_THRESHOLD = width * 0.25

type CardProps = {
	name: string
	onSwipeComplete: (direction: 'left' | 'right') => void
	translateX: SharedValue<number>
	scale: SharedValue<number>
}

export const Card = ({ name, onSwipeComplete, translateX, scale }: CardProps) => {
	const panGesture = Gesture.Pan()
		.onUpdate(event => {
			translateX.value = event.translationX
			const progress = Math.min(Math.abs(event.translationX) / (width * 0.6), 1)
			scale.value = 1 - progress * 0.05
		})
		.onEnd(event => {
			if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
				const direction = event.translationX > 0 ? 'right' : 'left'
				runOnJS(onSwipeComplete)(direction)
			} else {
				translateX.value = withSpring(0)
			}
		})

	const cardStyle = useAnimatedStyle(() => {
		const rotate = (translateX.value / width) * 12
		return {
			transform: [{ translateX: translateX.value }, { rotate: `${rotate}deg` }, { scale: scale.value }],
		}
	})

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={[styles.card, cardStyle]}>
				<AppText adjustsFontSizeToFit className="text-center text-4xl font-bold text-dark" numberOfLines={3}>
					{name}
				</AppText>
			</Animated.View>
		</GestureDetector>
	)
}

const styles = StyleSheet.create({
	card: {
		width: width * 0.78,
		height: width * 0.52,
		borderRadius: 24,
		backgroundColor: Colors.light,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 6,
		borderWidth: 1,
		borderColor: Colors.whiteTransparent5,
	},
})
