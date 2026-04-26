import { ChevronLeft, X } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { colors } from '@app/theme/colors'
import AppText from './AppText'

const HIT = 8

interface CloseLeading {
	kind: 'close-circle'
	onPress: () => void
	a11yLabel: string
	testID?: string
	disabled?: boolean
}

interface BackLeading {
	kind: 'back'
	onPress: () => void
	a11yLabel: string
	testID?: string
}

interface BackCircleLeading {
	kind: 'back-circle'
	onPress: () => void
	a11yLabel: string
	testID?: string
}

interface NoLeading {
	kind: 'none'
}

export type ScreenHeaderLeading = CloseLeading | BackLeading | BackCircleLeading | NoLeading

export interface ScreenHeaderProps {
	title?: string
	titleNode?: ReactNode
	titleVariant?: 'h2' | 'h3'
	leading?: ScreenHeaderLeading
	trailing?: ReactNode
	className?: string
}

function LeadingControl({ leading }: { leading: ScreenHeaderLeading }) {
	if (leading.kind === 'none') return null

	if (leading.kind === 'close-circle' || leading.kind === 'back-circle') {
		const isClose = leading.kind === 'close-circle'
		return (
			<Pressable
				accessibilityLabel={leading.a11yLabel}
				className="h-10 w-10 items-center justify-center rounded-full bg-bg-elevated"
				disabled={isClose ? leading.disabled : false}
				hitSlop={HIT}
				onPress={leading.onPress}
				testID={leading.testID}>
				{isClose ? <X color={colors['text']} size={22} /> : <ChevronLeft color={colors['text']} size={22} />}
			</Pressable>
		)
	}

	return (
		<Pressable
			accessibilityLabel={leading.a11yLabel}
			className="h-10 w-10 items-center justify-center"
			hitSlop={HIT}
			onPress={leading.onPress}
			testID={leading.testID}>
			<ChevronLeft color={colors['accent']} size={28} />
		</Pressable>
	)
}

export function ScreenHeader({
	title,
	titleNode,
	titleVariant = 'h3',
	leading = { kind: 'none' },
	trailing,
	className = 'px-5 pb-2',
}: ScreenHeaderProps) {
	return (
		<View className={`flex-row items-center ${className}`}>
			<View className="w-11 items-start">
				<LeadingControl leading={leading} />
			</View>

			{titleNode ? (
				<View className="flex-1 items-center justify-center">{titleNode}</View>
			) : (
				<AppText className="flex-1 text-center text-text" numberOfLines={1} variant={titleVariant}>
					{title}
				</AppText>
			)}

			<View className="w-11 items-end">{trailing}</View>
		</View>
	)
}
