import { Portal } from '@rn-primitives/portal'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { CircleCheck, Info, TriangleAlert } from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native'
import Animated, {
	cancelAnimation,
	interpolateColor,
	runOnJS,
	type SharedValue,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated'
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens'
import { useShallow } from 'zustand/react/shallow'
import useAlert, { type AlertVariant } from '@app/shared/hooks/useAlert'
import useHaptics from '@app/shared/hooks/useHaptics'
import { type ThemeColors, useThemeColors } from '@app/shared/theme/colors'
import { AppText } from '@app/shared/ui'

const PORTAL_NAME = 'app-alert'
const ICON_SIZE = 56
const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment

// iOS 26 alert: card enters scaled-up and contracts to identity (settles in),
// exits by receding slightly + fade.
const ENTER_SPRING = { damping: 22, stiffness: 340, mass: 0.9 } as const
const EXIT_FADE_MS = 160
const INITIAL_CARD_SCALE = 1.15
const EXIT_CARD_SCALE = 0.9
// Card depresses ~1.5% when any action button is pressed (Liquid Glass feel).
const CARD_PRESSED_SCALE_DELTA = 0.015
const PRESS_SPRING = { damping: 16, stiffness: 420, mass: 0.6 } as const
const BACKDROP_BLUR_INTENSITY = 14

// Default CTA label per variant. Error / destructive-confirm acknowledge,
// success / info / plain celebrate. Callers can override via `continueButtonText`.
const DEFAULT_CTA_KEY: Record<AlertVariant, string> = {
	'success': 'modules.common.great',
	'info': 'modules.common.gotIt',
	'error': 'modules.common.gotIt',
	'destructive-confirm': 'modules.common.gotIt',
	'plain': 'modules.common.great',
}

type IconRenderer = (colors: ThemeColors) => React.ReactNode

const VARIANT_ICON: Record<AlertVariant, IconRenderer | null> = {
	'success': colors => <CircleCheck color={colors.success} size={ICON_SIZE} strokeWidth={1.75} />,
	'info': colors => <Info color={colors.accent} size={ICON_SIZE} strokeWidth={1.75} />,
	'error': colors => <TriangleAlert color={colors.danger} size={ICON_SIZE} strokeWidth={1.75} />,
	'destructive-confirm': colors => <TriangleAlert color={colors.danger} size={ICON_SIZE} strokeWidth={1.75} />,
	'plain': null,
}

function variantHaptic(variant: AlertVariant): Haptics.NotificationFeedbackType | null {
	switch (variant) {
		case 'success':
			return Haptics.NotificationFeedbackType.Success
		case 'error':
		case 'destructive-confirm':
			return Haptics.NotificationFeedbackType.Warning
		case 'info':
			return Haptics.NotificationFeedbackType.Success
		case 'plain':
			return null
	}
}

interface AlertSnapshot {
	title: string
	description?: string
	variant: AlertVariant
	continueButtonText?: string
	cancelButtonText?: string
	continueVariant?: ActionVariant
	cancelVariant?: ActionVariant
	cancelable?: boolean
	onContinue?: () => void
	onCancel?: () => void
	onDismiss?: () => void
}

export default function AppAlert() {
	const { t } = useTranslation()
	const colors = useThemeColors()
	const { triggerSelection } = useHaptics()
	const {
		visible,
		title,
		description,
		variant,
		continueButtonText,
		cancelButtonText,
		continueVariant,
		cancelVariant,
		onContinue,
		onCancel,
		onDismiss,
		cancelable,
		hideAlert,
	} = useAlert(
		useShallow(state => ({
			visible: state.visible,
			title: state.title,
			description: state.description,
			variant: state.variant,
			continueButtonText: state.continueButtonText,
			cancelButtonText: state.cancelButtonText,
			continueVariant: state.continueVariant,
			cancelVariant: state.cancelVariant,
			onContinue: state.onContinue,
			onCancel: state.onCancel,
			onDismiss: state.onDismiss,
			cancelable: state.cancelable,
			hideAlert: state.hideAlert,
		})),
	)

	const wasVisibleRef = useRef(false)
	const reducedMotion = useReducedMotion()

	// `mounted` lags `visible` so the exit animation can finish before unmount.
	// `snapshot` lags too — `hideAlert` clears the store immediately, so without the
	// snapshot the exit animation would render default-variant + empty title (visible flash).
	const [mounted, setMounted] = useState(false)
	// Read inside the animation effect without re-running it: setMounted(true) would otherwise
	// cancel and restart the enter animation on the next commit.
	const mountedRef = useRef(false)
	mountedRef.current = mounted
	const [snapshot, setSnapshot] = useState<AlertSnapshot | null>(null)

	// `progress` drives both backdrop and card opacity (0 = hidden, 1 = settled).
	// `cardScale` is separate so enter (spring to 1 from 1.15) and exit (timing
	// to 0.9) can target different end-points.
	const progress = useSharedValue(0)
	const cardScale = useSharedValue(INITIAL_CARD_SCALE)
	const cardPressed = useSharedValue(0)

	const backdropAnimatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }))
	const cardAnimatedStyle = useAnimatedStyle(() => {
		const pressedScale = 1 - cardPressed.value * CARD_PRESSED_SCALE_DELTA
		return {
			opacity: progress.value,
			transform: [{ scale: cardScale.value * pressedScale }],
		}
	})

	useEffect(() => {
		if (!visible) return
		setSnapshot({
			title,
			description,
			variant: variant ?? 'success',
			continueButtonText,
			cancelButtonText,
			continueVariant,
			cancelVariant,
			cancelable,
			onContinue,
			onCancel,
			onDismiss,
		})
	}, [
		visible,
		title,
		description,
		variant,
		continueButtonText,
		cancelButtonText,
		continueVariant,
		cancelVariant,
		cancelable,
		onContinue,
		onCancel,
		onDismiss,
	])

	useEffect(() => {
		// Cancel any in-flight animations before scheduling new ones. Without
		// this a quick show → hide → show flip can land the exit's `setMounted(false)`
		// callback after the new show, unmounting the freshly-opened alert.
		cancelAnimation(progress)
		cancelAnimation(cardScale)
		if (visible) {
			setMounted(true)
			cardScale.value = INITIAL_CARD_SCALE
			progress.value = withTiming(1, { duration: 200 })
			cardScale.value = reducedMotion ? withTiming(1, { duration: 160 }) : withSpring(1, ENTER_SPRING)
			return
		}
		if (!mountedRef.current) return
		cardScale.value = withTiming(EXIT_CARD_SCALE, { duration: EXIT_FADE_MS })
		progress.value = withTiming(0, { duration: EXIT_FADE_MS }, finished => {
			if (finished) runOnJS(setMounted)(false)
		})
	}, [visible, progress, cardScale, reducedMotion])

	useEffect(() => {
		if (visible && !wasVisibleRef.current) {
			const haptic = variantHaptic(variant ?? 'success')
			if (haptic !== null) Haptics.notificationAsync(haptic)
		}
		wasVisibleRef.current = visible
	}, [visible, variant])

	const hideThen = useCallback(
		(callback?: () => void) => {
			// The card stays on screen during the exit fade; a second tap must not run the action again.
			if (!useAlert.getState().visible) return
			triggerSelection()
			hideAlert()
			callback?.()
		},
		[hideAlert, triggerSelection],
	)

	const handleContinue = useCallback(() => {
		hideThen(snapshot?.onContinue)
	}, [hideThen, snapshot])

	const handleCancel = useCallback(() => {
		hideThen(snapshot?.onCancel)
	}, [hideThen, snapshot])

	const handleDismiss = useCallback(() => {
		hideThen(snapshot?.onDismiss)
	}, [hideThen, snapshot])

	const handleBackdropPress = useCallback(() => {
		if (!snapshot?.cancelable) return
		handleDismiss()
	}, [snapshot, handleDismiss])

	useEffect(() => {
		if (!visible || Platform.OS !== 'android') return
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			handleDismiss()
			return true
		})
		return () => sub.remove()
	}, [handleDismiss, visible])

	if (!mounted || !snapshot) return null

	const renderIcon = VARIANT_ICON[snapshot.continueVariant === 'destructive' ? 'error' : snapshot.variant]
	const cancelLabel = snapshot.cancelButtonText

	return (
		<Portal name={PORTAL_NAME}>
			<FullWindowOverlay>
				<View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
					<AnimatedPressable
						// Not an accessibility element: it would swallow the card's buttons into one control.
						accessible={false}
						accessibilityViewIsModal
						className="flex-1 items-center justify-center px-7"
						onPress={handleBackdropPress}
						// During the exit fade, swallow taps (box-only) instead of passing them to the screen behind.
						pointerEvents={visible ? 'auto' : 'box-only'}
						style={backdropAnimatedStyle}
						testID="AppAlertOverlay">
						{/* iOS only: expo-blur 57 needs the blurred content wrapped in a BlurTargetView on Android
						    (else it falls back to no blur with a warning); the scrim alone dims it there. */}
						{Platform.OS === 'ios' ? (
							<BlurView
								intensity={BACKDROP_BLUR_INTENSITY}
								pointerEvents="none"
								style={StyleSheet.absoluteFill}
								tint="dark"
							/>
						) : null}
						<View className="bg-black/35" pointerEvents="none" style={StyleSheet.absoluteFill} />
						<Animated.View
							accessibilityViewIsModal
							className="w-full max-w-[360px] items-center gap-2 rounded-[32px] bg-bg-elevated p-6 shadow-xl"
							onStartShouldSetResponder={() => true}
							style={cardAnimatedStyle}
							testID="AppAlertCard">
							{renderIcon ? renderIcon(colors) : null}
							{/* Announced as one alert; the buttons stay separate accessibility elements. */}
							<View
								accessibilityLiveRegion="polite"
								accessibilityRole="alert"
								accessible
								className="items-center gap-1">
								<AppText className="max-w-[90%] text-center text-text" variant="h2">
									{snapshot.title}
								</AppText>
								{snapshot.description ? (
									<AppText className="text-center text-text-secondary" variant="tm">
										{snapshot.description}
									</AppText>
								) : null}
							</View>
							<View className="mt-2 w-full flex-row items-center justify-center gap-3">
								<ActionButton
									cardPressed={cardPressed}
									colors={colors}
									label={snapshot.continueButtonText ?? t(DEFAULT_CTA_KEY[snapshot.variant])}
									onPress={handleContinue}
									small={!!cancelLabel}
									style={cancelLabel ? styles.actionFlexHalf : styles.actionFlex}
									testID="AppAlertContinue"
									variant={snapshot.continueVariant ?? 'primary'}
								/>
								{cancelLabel ? (
									<ActionButton
										cardPressed={cardPressed}
										colors={colors}
										label={cancelLabel}
										onPress={handleCancel}
										small
										style={styles.actionFlex}
										testID="AppAlertCancel"
										variant={snapshot.cancelVariant ?? 'secondary'}
									/>
								) : null}
							</View>
						</Animated.View>
					</AnimatedPressable>
				</View>
			</FullWindowOverlay>
		</Portal>
	)
}

// ─── ActionButton ─────────────────────────────────────────────────────────────

type ActionVariant = 'primary' | 'secondary' | 'destructive'

// Press background tint per variant, from the theme. Subtle so it doesn't fight the whole-card depress.
function actionBackground(variant: ActionVariant, colors: ThemeColors): { idle: string; pressed: string } {
	switch (variant) {
		case 'primary':
			return { idle: colors.accent, pressed: colors['accent-pressed'] }
		case 'secondary':
			return { idle: 'rgba(0, 0, 0, 0)', pressed: colors['accent-soft'] }
		case 'destructive':
			return { idle: colors.danger, pressed: colors.danger }
	}
}

// Filled buttons use the on-fill token (AA-checked per theme); the outline button uses accent text.
const ACTION_TEXT: Record<ActionVariant, string> = {
	primary: 'text-text-on-accent',
	secondary: 'text-accent',
	destructive: 'text-text-on-danger',
}

interface ActionButtonProps {
	colors: ThemeColors
	label: string
	onPress: () => void
	variant: ActionVariant
	cardPressed: SharedValue<number>
	testID?: string
	style?: ViewStyle
	small?: boolean
}

function ActionButton({ colors, label, onPress, variant, cardPressed, testID, style, small }: ActionButtonProps) {
	const pressed = useSharedValue(0)

	const handlePressIn = useCallback(() => {
		pressed.value = withSpring(1, PRESS_SPRING)
		cardPressed.value = withSpring(1, PRESS_SPRING)
	}, [pressed, cardPressed])

	const handlePressOut = useCallback(() => {
		pressed.value = withSpring(0, PRESS_SPRING)
		cardPressed.value = withSpring(0, PRESS_SPRING)
	}, [pressed, cardPressed])

	const { idle, pressed: pressedColor } = actionBackground(variant, colors)
	const animatedStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(pressed.value, [0, 1], [idle, pressedColor]),
	}))

	const baseStyle = variant === 'secondary' ? { borderWidth: 2, borderColor: colors.accent } : null

	return (
		<AnimatedPressable
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[styles.actionBase, baseStyle, animatedStyle, style, small && styles.actionSmall]}
			testID={testID}>
			<AppText
				adjustsFontSizeToFit
				className={ACTION_TEXT[variant]}
				minimumFontScale={0.85}
				numberOfLines={1}
				style={[small && { fontSize: 14 }, variant === 'destructive' && { fontWeight: 'bold' }]}
				variant={'tl'}>
				{label}
			</AppText>
		</AnimatedPressable>
	)
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const styles = StyleSheet.create({
	actionBase: {
		minHeight: 52,
		paddingHorizontal: 16,
		borderRadius: 9999,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	// Two-button rows use the compact size; still a 48px touch target.
	actionSmall: { minHeight: 48 },
	actionFlex: { flex: 1 },
	actionFlexHalf: { flex: 1, maxWidth: '50%' },
})
