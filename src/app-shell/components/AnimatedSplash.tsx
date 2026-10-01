import { LinearGradient } from 'expo-linear-gradient'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
	Easing,
	interpolate,
	ReduceMotion,
	runOnJS,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from 'react-native-reanimated'
import { BRAND_GRADIENT, SPLASH_BACKGROUND, SPLASH_ICON_SIZE } from '@app/shared/theme/brand'

const splashIcon = require('../../../assets/png/splash-icon.png')

const INTRO_MS = 450
const OUTRO_MS = 250
// The fade starts over the slow tail of the ease-out intro, so the two read as one motion.
const OUTRO_DELAY_MS = 300
// Safety net: an animation callback that never reports `finished` must not pin the splash over the app.
const HIDE_TIMEOUT_MS = OUTRO_DELAY_MS + OUTRO_MS + 500
const GLOW_SIZE = 160

interface AnimatedSplashProps {
	/** App content is ready behind the splash (e.g. auth hydrated). */
	ready: boolean
	onHidden: () => void
}

/**
 * Takes over from the native splash: draws the icon exactly where `expo-splash-screen` does,
 * hides the native one once painted, then plays the brand intro and fades out.
 */
const AnimatedSplash = ({ ready, onHidden }: AnimatedSplashProps) => {
	const reduceMotion = useReducedMotion()
	const intro = useSharedValue(0)
	const outro = useSharedValue(0)
	const painted = useRef({ layout: false, image: false, hidden: false })
	const reported = useRef(false)

	// Fade callback and fallback timeout can both fire; the parent hears it once.
	const reportHidden = () => {
		if (reported.current) return
		reported.current = true
		onHidden()
	}

	const hideNativeSplash = () => {
		if (painted.current.hidden) return
		painted.current.hidden = true
		SplashScreen.hide()
	}

	// Native splash stays up until our identical first frame is on screen, so the handover is invisible.
	const hideNativeSplashWhenPainted = (part: 'layout' | 'image') => {
		painted.current[part] = true
		if (painted.current.layout && painted.current.image) hideNativeSplash()
	}

	const containerStyle = useAnimatedStyle(() => ({ opacity: 1 - outro.value }))
	const gradientStyle = useAnimatedStyle(() => ({
		opacity: interpolate(intro.value, [0, 0.5], [0, 1], 'clamp'),
	}))
	const glowStyle = useAnimatedStyle(() => ({
		// Invisible at rest so the first frame matches the native splash exactly.
		opacity: interpolate(intro.value, [0, 0.05, 1], [0, 0.4, 0]),
		transform: [{ scale: interpolate(intro.value, [0, 1], [0.6, 2.4]) }],
	}))
	const iconStyle = useAnimatedStyle(() => ({
		transform: [
			{
				scale: interpolate(intro.value, [0, 0.4, 1], [1, 1.15, 1.1]) * interpolate(outro.value, [0, 1], [1, 0.8]),
			},
		],
	}))

	// Android fades the native splash for 400ms by default (crossfading over the intro). setOptions is queued
	// on the main thread there, so set it on mount — well before hide() runs after layout + image load.
	useEffect(() => {
		SplashScreen.setOptions({ duration: 0, fade: false })
	}, [])

	useEffect(() => {
		if (!ready) return
		// Content behind is ready: never let a missed image load pin the native splash.
		hideNativeSplash()
		// A plain fade is fine under reduced motion; without `Never`, Reanimated would skip it entirely.
		const fadeOut = withTiming(
			1,
			{ duration: OUTRO_MS, easing: Easing.in(Easing.cubic), reduceMotion: ReduceMotion.Never },
			finished => {
				if (finished) runOnJS(reportHidden)()
			},
		)
		if (reduceMotion) {
			outro.value = fadeOut
		} else {
			intro.value = withTiming(1, { duration: INTRO_MS, easing: Easing.out(Easing.cubic) })
			outro.value = withDelay(OUTRO_DELAY_MS, fadeOut)
		}
		const hideTimeout = setTimeout(reportHidden, HIDE_TIMEOUT_MS)
		return () => clearTimeout(hideTimeout)
	}, [ready, reduceMotion, intro, outro, onHidden])

	return (
		<Animated.View
			// Opaque and blocking while visible: taps and screen readers must not reach the app behind it.
			accessibilityElementsHidden
			accessibilityViewIsModal
			importantForAccessibility="no-hide-descendants"
			onLayout={() => hideNativeSplashWhenPainted('layout')}
			style={[styles.container, containerStyle]}
			testID="animated-splash">
			<StatusBar style="light" />
			<Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
				<LinearGradient
					colors={BRAND_GRADIENT}
					end={{ x: 1, y: 0 }}
					locations={[0, 0.5, 1]}
					start={{ x: 0, y: 1 }}
					style={StyleSheet.absoluteFill}
				/>
			</Animated.View>
			{!reduceMotion && <Animated.View style={[styles.glow, glowStyle]} />}
			<Animated.Image
				onLoadEnd={() => hideNativeSplashWhenPainted('image')}
				source={splashIcon}
				style={[styles.icon, iconStyle]}
				testID="animated-splash-icon"
			/>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: SPLASH_BACKGROUND,
		zIndex: 1000,
	},
	glow: {
		position: 'absolute',
		width: GLOW_SIZE,
		height: GLOW_SIZE,
		borderRadius: GLOW_SIZE / 2,
		backgroundColor: '#FFFFFF',
	},
	icon: {
		width: SPLASH_ICON_SIZE,
		height: SPLASH_ICON_SIZE,
	},
})

export default AnimatedSplash
