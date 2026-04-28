import type { ReactNode } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardScrollView, ScreenHeader, type ScreenHeaderLeading } from '@app/components/shared'

const PADDING_H = 20

interface AuthScreenProps {
	headerTitle?: string
	headerLeading?: ScreenHeaderLeading
	paddingTop?: number
	children: ReactNode
}

export function AuthScreen({ headerTitle, headerLeading, paddingTop = 96, children }: AuthScreenProps) {
	const hasHeader = headerTitle && headerLeading
	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			{hasHeader ? <ScreenHeader className="px-5 pb-2 pt-2" leading={headerLeading} title={headerTitle} /> : null}
			<KeyboardScrollView contentContainerStyle={{ paddingHorizontal: PADDING_H, paddingTop }}>
				{children}
			</KeyboardScrollView>
		</SafeAreaView>
	)
}
