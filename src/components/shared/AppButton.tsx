import React, { useCallback } from 'react'
import { ActivityIndicator, Pressable, PressableProps, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { type ThemeColors, useThemeColors } from '@app/theme/colors'
import { cn } from '@app/utils'
import AppText from './AppText'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive'

interface VariantSpec {
	container: string
	text: string
	textVariant: 'btn' | 'ts'
}

const VARIANTS: Record<AppButtonVariant, VariantSpec> = {
	primary: { container: 'bg-accent border-accent', text: 'text-text-on-accent', textVariant: 'btn' },
	secondary: { container: 'bg-transparent border-accent', text: 'text-accent', textVariant: 'btn' },
	ghost: { container: 'bg-accent-soft border-transparent', text: 'text-accent', textVariant: 'btn' },
	link: {
		container: 'bg-transparent border-transparent h-auto px-0',
		text: 'text-accent underline',
		textVariant: 'ts',
	},
	destructive: { container: 'bg-transparent border-danger', text: 'text-danger', textVariant: 'btn' },
}

// Spinner colour matches each variant's label colour.
const SPINNER_COLOR: Record<AppButtonVariant, keyof ThemeColors> = {
	primary: 'text-on-accent',
	secondary: 'accent',
	ghost: 'accent',
	link: 'accent',
	destructive: 'danger',
}

const DISABLED_OPACITY = 0.4
const PRESS_DURATION = 80
const RELEASE_DURATION = 140

interface AppButtonProps extends PressableProps {
	variant?: AppButtonVariant
	disabled?: boolean
	/** Shows a spinner in place of the label and blocks presses; the button keeps its size and colour. */
	loading?: boolean
	fullWidth?: boolean
	pressedOpacity?: number
	pressedScale?: number
	children: React.ReactNode
	className?: string
	textClassName?: string
	onPress?: () => void
}

const AppButton = ({
	variant = 'primary',
	disabled = false,
	loading = false,
	fullWidth = false,
	pressedOpacity = 0.55,
	pressedScale = 0.96,
	children,
	className: extraClassName,
	textClassName,
	onPress,
	accessibilityLabel,
	...rest
}: AppButtonProps) => {
	const v = VARIANTS[variant]
	const isLink = variant === 'link'

	const scale = useSharedValue(1)
	const opacity = useSharedValue(1)

	const colors = useThemeColors()
	const inactive = disabled || loading
	// Dimming lives in the animated style: a className opacity would be overridden by this inline one.
	const dimmed = disabled && !loading

	const animatedStyle = useAnimatedStyle(
		() => ({
			transform: [{ scale: scale.value }],
			opacity: (dimmed ? DISABLED_OPACITY : 1) * opacity.value,
		}),
		[dimmed],
	)

	const onPressIn = useCallback(() => {
		if (inactive) return
		scale.value = withTiming(pressedScale, { duration: PRESS_DURATION })
		opacity.value = withTiming(pressedOpacity, { duration: PRESS_DURATION })
	}, [inactive, pressedScale, pressedOpacity])

	const onPressOut = useCallback(() => {
		scale.value = withTiming(1, { duration: RELEASE_DURATION })
		opacity.value = withTiming(1, { duration: RELEASE_DURATION })
	}, [])

	const containerClasses = cn(
		'flex-row items-center justify-center rounded-2xl border',
		!isLink && 'h-[50px] px-6',
		v.container,
		fullWidth ? 'w-full' : 'self-center',
		extraClassName,
	)

	const textClasses = cn(v.text, textClassName, 'text-center')

	return (
		<AnimatedPressable
			accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
			accessibilityRole="button"
			accessibilityState={{ disabled: inactive, busy: loading }}
			className={containerClasses}
			disabled={inactive}
			onPress={inactive ? undefined : onPress}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={animatedStyle}
			{...rest}>
			{/* The label stays in layout (transparent) so the button doesn't change size while loading. */}
			<View style={loading ? { opacity: 0 } : undefined}>
				{typeof children === 'string' ? (
					<AppText className={textClasses} variant={v.textVariant}>
						{children}
					</AppText>
				) : (
					children
				)}
			</View>
			{loading ? (
				<ActivityIndicator className="absolute" color={colors[SPINNER_COLOR[variant]]} testID="app-button-spinner" />
			) : null}
		</AnimatedPressable>
	)
}

export default AppButton
