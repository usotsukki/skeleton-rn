import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { DrawerMenuButton } from '@app/components/drawer'
import { useTabStackScreenOptions } from '@app/hooks/useTabStackScreenOptions'

export default function SkiaStackLayout() {
	const { t } = useTranslation()
	const screenOptions = useTabStackScreenOptions(() => <DrawerMenuButton />)

	return (
		<Stack screenOptions={screenOptions}>
			<Stack.Screen name="index" options={{ title: t('skia') }} />
		</Stack>
	)
}
