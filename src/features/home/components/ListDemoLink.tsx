import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { AppButton, SectionHeader } from '@app/shared/ui'

/** Opens the CachedList states demo (`ListDemoScreen`). Demo only. */
export function ListDemoLink() {
	const { t } = useTranslation()
	const router = useRouter()
	return (
		<>
			<SectionHeader title={t('listDemo.title')} />
			<View className="px-4">
				<AppButton fullWidth onPress={() => router.push('/Home/ListDemo')} variant="secondary">
					{t('listDemo.open')}
				</AppButton>
			</View>
		</>
	)
}
