import { View } from 'react-native'
import { cn } from '@app/shared/utils'
import AppButton from './AppButton'
import AppText from './AppText'

interface ScreenStateProps {
	title: string
	message?: string
	actionLabel?: string
	onAction?: () => void
	className?: string
}

/** Centered full-area state: empty, blocking error, offline. */
export function ScreenState({ title, message, actionLabel, onAction, className }: ScreenStateProps) {
	return (
		<View className={cn('flex-1 items-center justify-center gap-3 px-8 py-12', className)}>
			<AppText accessibilityRole="header" className="text-center text-text" variant="h3">
				{title}
			</AppText>
			{message ? (
				<AppText className="text-center text-text-secondary" variant="tm">
					{message}
				</AppText>
			) : null}
			{actionLabel && onAction ? (
				<View className="pt-2">
					<AppButton onPress={onAction}>{actionLabel}</AppButton>
				</View>
			) : null}
		</View>
	)
}
