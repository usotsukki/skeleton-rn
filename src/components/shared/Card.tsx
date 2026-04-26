import { type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { cn } from '@app/utils'

interface CardProps extends ViewProps {
	className?: string
	children: ReactNode
}

/** Standard rounded surface with subtle elevation. iOS grouped-style. */
export function Card({ className, children, ...rest }: CardProps) {
	return (
		<View className={cn('overflow-hidden rounded-2xl bg-bg-elevated', className)} {...rest}>
			{children}
		</View>
	)
}
