import { Stack } from 'expo-router/stack'
import { useTranslation } from 'react-i18next'
import { stackHeaderScreenOptions } from '@app/utils/navigation'

const DemoStackLayout = () => {
	const { t } = useTranslation()
	return (
		<Stack initialRouteName="Demo" screenOptions={stackHeaderScreenOptions}>
			<Stack.Screen name="Demo" options={{ title: t('demo') }} />
		</Stack>
	)
}
export default DemoStackLayout
