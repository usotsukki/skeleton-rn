import { ChevronRight } from 'lucide-react-native'
import { type ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { colors } from '@app/theme/colors'
import { cn } from '@app/utils'
import AppText from './AppText'

interface ListRowProps {
	leading?: ReactNode
	title: string
	subtitle?: string
	value?: string
	trailing?: ReactNode
	onPress?: () => void
	showChevron?: boolean
	destructive?: boolean
	first?: boolean
	last?: boolean
	testID?: string
}

const ROW_BASE = 'flex-row items-center bg-bg-elevated px-4 min-h-[52px]'

/** iOS-style settings row with leading icon, title/subtitle, optional trailing value + chevron.
 * Use `first`/`last` flags inside a Card-grouped list to control corner radius + separator. */
export function ListRow({
	leading,
	title,
	subtitle,
	value,
	trailing,
	onPress,
	showChevron = !!onPress,
	destructive = false,
	first: _first = false,
	last = false,
	testID,
}: ListRowProps) {
	const Container: typeof Pressable | typeof View = onPress ? Pressable : View

	return (
		<Container
			className={cn(ROW_BASE, !last && 'border-b border-separator', destructive && 'active:opacity-70')}
			onPress={onPress}
			testID={testID}>
			{leading && <View className="mr-3">{leading}</View>}
			<View className="flex-1">
				<AppText className={cn(destructive ? 'text-danger' : 'text-text')} variant="tm">
					{title}
				</AppText>
				{subtitle && (
					<AppText className="mt-0.5 text-text-muted" variant="ts">
						{subtitle}
					</AppText>
				)}
			</View>
			{value && (
				<AppText className="ml-2 text-text-muted" variant="tm">
					{value}
				</AppText>
			)}
			{trailing}
			{showChevron && <ChevronRight color={colors['text-muted']} size={18} style={{ marginLeft: 8 }} />}
		</Container>
	)
}

/** Visual wrapper used to round the first/last child of a list group. */
export function ListGroup({ children }: { children: ReactNode }) {
	return <View className="overflow-hidden rounded-2xl bg-bg-elevated">{children}</View>
}
