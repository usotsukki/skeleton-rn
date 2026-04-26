import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Easing,
	interpolate,
	LinearTransition,
	type SharedValue,
	SlideInUp,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'
import { AppText } from '@app/components/shared'
import useHaptics from '@app/hooks/useHaptics'
import useToast, { type ToastItem as ToastItemType, type ToastStyle } from '@app/hooks/useToast'
import { cn } from '@app/utils'

const C = {
	margin: 16,
	gap: 8,
	swipeThreshold: -50,
	swipeVelocity: -400,
	enter: 280,
	exit: 280,
	layout: 200,
	panSnap: 150,
	exitDelta: 30,
	exitExtraSlide: 10,
	exitMin: 180,
	exitBaseExtra: 240,
	swipeTarget: -600,
	swipeDuration: 140,
	closeFade: 120,
	hitSlop: 10,
} as const

const LAYOUT = LinearTransition.duration(C.layout)

const VARIANTS: Record<ToastStyle, string> = {
	success: 'bg-success border-success',
	error: 'bg-danger border-danger',
	info: 'bg-accent border-accent',
}

const BASE_CLASSES = 'flex-row items-center justify-between rounded-2xl border p-4 shadow-lg'
const CLOSE_LABEL = '✕'

function createExiting(
	stackIndex: number,
	translateY: SharedValue<number>,
	opacity: SharedValue<number>,
	dismissViaClose: SharedValue<number>,
) {
	const duration = Math.max(C.exitMin, C.exit - stackIndex * C.exitDelta)
	const extraSlide = stackIndex * C.exitExtraSlide
	const ease = Easing.out(Easing.cubic)

	return (values: { currentHeight: number }) => {
		'worklet'
		const fromY = translateY.value
		const toY = -(values.currentHeight + C.gap + extraSlide + C.exitBaseExtra)
		const startOp = opacity.value

		const anim = (
			op: number,
			opDur: number,
			tyTo: number,
			tyDur: number,
			tyEasing?: ReturnType<typeof Easing.out>,
		) => ({
			initialValues: { opacity: op, transform: [{ translateY: fromY }] },
			animations: {
				opacity: withTiming(0, { duration: opDur, ...(tyEasing && { easing: tyEasing }) }),
				transform: [{ translateY: withTiming(tyTo, { duration: tyDur, ...(tyEasing && { easing: tyEasing }) }) }],
			},
		})

		if (startOp === 0) return anim(0, 0, fromY, 0)
		if (dismissViaClose.value) return anim(startOp, C.closeFade, fromY, 0, ease)
		return anim(startOp, duration, toY, duration, ease)
	}
}

function ToastItem({
	toast,
	stackIndex,
	onDismiss,
}: {
	toast: ToastItemType
	stackIndex: number
	onDismiss: (id: string) => void
}) {
	const translateY = useSharedValue(0)
	const opacity = useSharedValue(1)
	const swipeFromY = useSharedValue(0)
	const isSwipeExiting = useSharedValue(false)
	const dismissViaClose = useSharedValue(0)

	const handleDismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss])
	const onClose = useCallback(() => {
		dismissViaClose.value = 1
		handleDismiss()
	}, [handleDismiss])

	const exiting = useMemo(() => createExiting(stackIndex, translateY, opacity, dismissViaClose), [stackIndex])

	const gesture = Gesture.Pan()
		.enabled(toast.isDismissable !== false)
		.onUpdate(e => {
			if (e.translationY < 0) translateY.value = e.translationY
		})
		.onEnd(e => {
			const dismiss = e.translationY < C.swipeThreshold || e.velocityY < C.swipeVelocity
			if (dismiss) {
				swipeFromY.value = translateY.value
				isSwipeExiting.value = true
				translateY.value = withTiming(
					C.swipeTarget,
					{ duration: C.swipeDuration, easing: Easing.out(Easing.cubic) },
					done => {
						if (done) {
							opacity.value = 0
							scheduleOnRN(handleDismiss)
						}
					},
				)
			} else {
				translateY.value = withTiming(0, { duration: C.panSnap })
			}
		})

	const style = useAnimatedStyle(() => {
		'worklet'
		const ty = translateY.value
		let op = 1
		if (isSwipeExiting.value) {
			op = interpolate(ty, [swipeFromY.value, C.swipeTarget], [1, 0], 'clamp')
		} else if (ty < 0) {
			op = 1 - 0.08 * Math.min(1, -ty / 80)
		}
		return { opacity: op, transform: [{ translateY: ty }] }
	})

	useEffect(() => {
		if (toast.duration > 0) {
			const t = setTimeout(() => onDismiss(toast.id), C.enter + toast.duration)
			return () => clearTimeout(t)
		}
	}, [toast.id, toast.duration, onDismiss])

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				className={cn(BASE_CLASSES, VARIANTS[toast.style ?? 'success'])}
				entering={SlideInUp.duration(C.enter)}
				exiting={exiting}
				layout={LAYOUT}
				style={style}>
				<View className="flex-1 pr-2">
					<AppText className="text-text-on-accent" variant="tmed">
						{toast.message}
					</AppText>
				</View>
				{toast.isDismissable !== false && (
					<Pressable hitSlop={C.hitSlop} onPress={onClose}>
						<AppText className="text-text-on-accent" variant="btn">
							{CLOSE_LABEL}
						</AppText>
					</Pressable>
				)}
			</Animated.View>
		</GestureDetector>
	)
}

const TOAST_STYLE_TO_HAPTIC: Record<ToastStyle, Haptics.NotificationFeedbackType> = {
	success: Haptics.NotificationFeedbackType.Success,
	info: Haptics.NotificationFeedbackType.Warning,
	error: Haptics.NotificationFeedbackType.Error,
}

export default function Toast() {
	const toasts = useToast(s => s.toasts)
	const hideToast = useToast(s => s.hideToast)
	const insets = useSafeAreaInsets()
	const { triggerNotification } = useHaptics()
	const prevCount = useRef(0)
	const prevNewestId = useRef<string | null>(null)

	useEffect(() => {
		const newest = toasts[toasts.length - 1]
		const newestId = newest?.id ?? null
		const shouldTrigger =
			Boolean(newest) && (toasts.length > prevCount.current || (newestId !== null && newestId !== prevNewestId.current))
		if (shouldTrigger) {
			triggerNotification(TOAST_STYLE_TO_HAPTIC[newest?.style ?? 'success'])
		}
		prevCount.current = toasts.length
		prevNewestId.current = newestId
	}, [toasts, triggerNotification])

	if (toasts.length === 0) return null

	return (
		<View
			pointerEvents="box-none"
			className="absolute left-0 right-0 z-[99]"
			style={{
				top: insets.top + C.margin,
				left: C.margin,
				right: C.margin,
				gap: C.gap,
			}}>
			{[...toasts].reverse().map((t, i) => (
				<ToastItem key={t.id} onDismiss={hideToast} stackIndex={i} toast={t} />
			))}
		</View>
	)
}
