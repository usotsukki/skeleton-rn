import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { AppButton, AppText } from '@app/components/shared'
import { IS_DEV } from '@app/env'

interface Props {
	error: Error
	resetErrorBoundary: () => void
}

const ErrorFallback = ({ error, resetErrorBoundary }: Props) => {
	const { t } = useTranslation()

	return (
		<View className="flex-1 items-center justify-center bg-bg px-5">
			<View className="w-full items-center gap-4 rounded-3xl bg-bg-elevated px-5 py-10">
				<AppText className="text-text" variant="h1">
					{t('error.title')}
				</AppText>
				<AppText className="text-center text-text-secondary" variant="tl">
					{t('error.subtitle')}
				</AppText>
				{error?.message && IS_DEV && (
					<AppText className="text-center text-danger" variant="ts">
						{error.message}
					</AppText>
				)}
				<AppButton onPress={resetErrorBoundary}>{t('error.button')}</AppButton>
			</View>
		</View>
	)
}

export default ErrorFallback
