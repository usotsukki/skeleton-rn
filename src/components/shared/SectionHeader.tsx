import { View } from 'react-native'
import { cn } from '@app/utils'
import AppText from './AppText'

interface SectionHeaderProps {
	title: string
	className?: string
}

/** Uppercase muted heading above a grouped list. iOS Settings style. */
export function SectionHeader({ title, className }: SectionHeaderProps) {
	return (
		<View className={cn('px-4 pb-2 pt-6', className)}>
			<AppText className="text-text-muted" variant="cap">
				{title.toUpperCase()}
			</AppText>
		</View>
	)
}
