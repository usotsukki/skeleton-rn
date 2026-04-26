import React, { useCallback } from 'react'
import { Pressable, PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
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

const PRESS_DURATION = 80
const RELEASE_DURATION = 140

interface AppButtonProps extends PressableProps {
	variant?: AppButtonVariant
	disabled?: boolean
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

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}))

	const onPressIn = useCallback(() => {
		if (disabled) return
		scale.value = withTiming(pressedScale, { duration: PRESS_DURATION })
		opacity.value = withTiming(pressedOpacity, { duration: PRESS_DURATION })
	}, [disabled, pressedScale, pressedOpacity])

	const onPressOut = useCallback(() => {
		scale.value = withTiming(1, { duration: RELEASE_DURATION })
		opacity.value = withTiming(1, { duration: RELEASE_DURATION })
	}, [])

	const containerClasses = cn(
		'flex-row items-center justify-center rounded-2xl border',
		!isLink && 'h-[50px] px-6',
		v.container,
		fullWidth ? 'w-full' : 'self-center',
		disabled && 'opacity-40',
		extraClassName,
	)

	const textClasses = cn(v.text, textClassName, 'text-center')

	return (
		<AnimatedPressable
			accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			className={containerClasses}
			disabled={disabled}
			onPress={disabled ? undefined : onPress}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			style={animatedStyle}
			{...rest}>
			{typeof children === 'string' ? (
				<AppText className={textClasses} variant={v.textVariant}>
					{children}
				</AppText>
			) : (
				children
			)}
		</AnimatedPressable>
	)
}

export default AppButton
