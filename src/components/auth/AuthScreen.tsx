import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, KeyboardScrollView, ScreenHeader, type ScreenHeaderLeading } from '@app/components/shared'
import { IS_LOCAL_BACKEND } from '@app/env'

const PADDING_H = 20

interface AuthScreenProps {
	headerTitle?: string
	headerLeading?: ScreenHeaderLeading
	paddingTop?: number
	children: ReactNode
}

export function AuthScreen({ headerTitle, headerLeading, paddingTop = 96, children }: AuthScreenProps) {
	const { t } = useTranslation()
	const hasHeader = headerTitle && headerLeading
	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			{hasHeader ? <ScreenHeader className="px-5 pb-2 pt-2" leading={headerLeading} title={headerTitle} /> : null}
			{/* Shows which backend this bundle uses; the e2e sign-in flow asserts it before typing the local password. */}
			{__DEV__ && IS_LOCAL_BACKEND ? (
				<AppText className="text-center text-text-muted" testID="backend-local" variant="ts">
					{t('modules.auth.localBackend')}
				</AppText>
			) : null}
			<KeyboardScrollView contentContainerStyle={{ paddingHorizontal: PADDING_H, paddingTop }}>
				{children}
			</KeyboardScrollView>
		</SafeAreaView>
	)
}
