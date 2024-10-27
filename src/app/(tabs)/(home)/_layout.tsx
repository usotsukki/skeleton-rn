import { Stack } from 'expo-router/stack'
import { useTranslation } from 'react-i18next'
import { stackHeaderScreenOptions } from '@app/utils/navigation'

const HomeStackLayout = () => {
	const { t } = useTranslation()
	return (
		<Stack screenOptions={stackHeaderScreenOptions} initialRouteName="Home">
			<Stack.Screen name="Home" options={{ title: t('modules.chat.chat') }} />
		</Stack>
	)
}
export default HomeStackLayout
