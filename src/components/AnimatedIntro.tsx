import { memo } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import {
	interpolate,
	interpolateColor,
	useAnimatedReaction,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withDelay,
	withTiming,
} from 'react-native-reanimated'
import { ReText } from 'react-native-redash'
import { Colors, View } from 'react-native-ui-lib'

const AnimatedIntro = () => {
	const content = [
		{
			title: 'Go further!',
			bg: Colors.lime,
			fontColor: Colors.pink,
		},
		{
			title: 'Discover more!',
			bg: Colors.brown,
			fontColor: Colors.sky,
		},
		{
			title: 'Move faster!',
			bg: Colors.orange,
			fontColor: Colors.blue,
		},
		{
			title: 'Think different!',
			bg: Colors.teal,
			fontColor: Colors.yellow,
		},
	]

	const { width } = useWindowDimensions()
	const ballWidth = 34
	const half = width / 2 - ballWidth / 2

	const currentX = useSharedValue(half)
	const currentIndex = useSharedValue(0)
	const isAtStart = useSharedValue(true)
	const labelWidth = useSharedValue(0)
	const canGoToNext = useSharedValue(false)
	const didPlay = useSharedValue(false)

	const newColorIndex = useDerivedValue(() => {
		if (!isAtStart.value) {
			return (currentIndex.value + 1) % content.length
		}
		return currentIndex.value
	}, [currentIndex, isAtStart])

	const text = useDerivedValue(() => {
		const index = currentIndex.value
		return content[index].title
	}, [currentIndex])

	useAnimatedReaction(
		() => labelWidth.value,
		newWidth => {
			currentX.value = withDelay(
				1000,
				withTiming(
					half + newWidth / 2,
					{
						duration: 800,
					},
					finished => {
						if (finished) {
							canGoToNext.value = true
							isAtStart.value = false
						}
					},
				),
			)
		},
		[labelWidth, currentX, half],
	)

	useAnimatedReaction(
		() => canGoToNext.value,
		next => {
			if (!next) {
				return
			}
			const calculateWidth = (input: string): number => {
				return (
					input.split('').reduce((a, b) => {
						const size = 18
						const halfWidth = b.match(/[!.,'":\s]/)
						const widerChar = b.match(/[A-Z]/)
						if (widerChar) {
							return a + size * 1.4
						} else if (halfWidth) {
							return a + size * 0.5
						} else {
							return a + size
						}
					}, 0) + 4
				)
			}

			canGoToNext.value = false
			currentX.value = withDelay(
				1000,
				withTiming(
					half,
					{
						duration: 800,
					},
					finished => {
						if (!finished) {
							return
						}
						currentIndex.value = (currentIndex.value + 1) % content.length
						isAtStart.value = true
						didPlay.value = false
						labelWidth.value = calculateWidth(content[currentIndex.value].title)
					},
				),
			)
		},
		[currentX, labelWidth, currentIndex],
	)

	const textStyle = useAnimatedStyle(() => {
		return {
			color: interpolateColor(
				currentX.value,
				[half, half + labelWidth.value / 2],
				[content[newColorIndex.value].fontColor, content[currentIndex.value].fontColor],
				'RGB',
			),
			transform: [
				{
					translateX: interpolate(
						currentX.value,
						[half, half + labelWidth.value / 2],
						[half + 4, half - labelWidth.value / 2],
					),
				},
			],
		}
	}, [currentIndex, currentX])

	const ballStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: interpolateColor(
				currentX.value,
				[half, half + labelWidth.value / 2],
				[content[newColorIndex.value].fontColor, content[currentIndex.value].fontColor],
				'RGB',
			),
			transform: [{ translateX: currentX.value }],
		}
	})

	const mask = useAnimatedStyle(
		() => ({
			backgroundColor: interpolateColor(
				currentX.value,
				[half, half + labelWidth.value / 2],
				[content[newColorIndex.value].bg, content[currentIndex.value].bg],
				'RGB',
			),
			transform: [{ translateX: currentX.value }],
			width: width / 1.5,
			borderTopLeftRadius: 20,
			borderBottomLeftRadius: 20,
		}),
		[currentIndex, currentX, labelWidth],
	)

	const wrapperStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			currentX.value,
			[half, half + labelWidth.value / 2],
			[content[newColorIndex.value].bg, content[currentIndex.value].bg],
			'RGB',
		),
		opacity: interpolate(1, [1, 0], [1, 0, 0, 0, 0, 0, 0]),
		transform: [
			{
				translateX: interpolate(1, [1, 0], [0, -width * 2, -width, -width, -width, -width, -width]),
			},
		],
	}))

	return (
		<View reanimated style={[styles.wrapper, wrapperStyle]}>
			<View reanimated style={[styles.content]}>
				<View reanimated style={[styles.ball, ballStyle]} />
				<View reanimated style={[styles.mask, mask]} />
				<ReText
					onLayout={e => {
						labelWidth.value = e.nativeEvent.layout.width + 4
					}}
					style={[styles.title, textStyle]}
					text={text}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	mask: {
		zIndex: 1,
		position: 'absolute',
		left: '0%',
		height: 44,
	},
	ball: {
		width: 40,
		zIndex: 10,
		height: 40,
		backgroundColor: '#000',
		borderRadius: 20,
		position: 'absolute',
		left: '0%',
	},
	titleText: {
		flexDirection: 'row',
	},
	title: {
		fontSize: 36,
		fontWeight: '600',
		left: '0%',
		position: 'absolute',
	},
	content: {
		marginTop: 300,
	},
})

export default memo(AnimatedIntro)
