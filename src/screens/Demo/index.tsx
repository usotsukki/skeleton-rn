import { withProfiler } from '@sentry/react-native'
import { AppText } from '@shared'
import { scheduleNotificationAsync } from 'expo-notifications'
import { useTranslation } from 'react-i18next'
import { Button, Colors, View } from 'react-native-ui-lib'
import { useAuth, useJokes } from '@app/hooks'

const Demo = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.demoScreen' })
	const { signOut } = useAuth()
	const jokeQuery = useJokes()

	const scheduleNotification = async () => {
		await scheduleNotificationAsync({
			content: {
				title: t('jokeOfTheDay'),
				body: jokeQuery.data?.joke,
			},
			trigger: null,
		})
		jokeQuery.refetch()
	}

	return (
		<View flex backgroundColor={Colors.grayBlack} center gap-s4 testID="Demo">
			<Button label={t('getRandomJoke')} onPress={scheduleNotification} />
			<Button label={i18n.t('modules.auth.signOut')} onPress={signOut} testID="Demo.SignOutButton" />

			<AppText className="font-sfMono text-6xl font-normal text-gray-100">{'Demo 0123'}</AppText>
			<AppText className="text-6xl font-normal text-gray-50">{'Demo 0123'}</AppText>
			<AppText className="text-6xl font-medium text-gray-100">{'Demo 0123'}</AppText>
			<AppText className="text-6xl font-semibold text-gray-200">{'Demo 0123'}</AppText>
			<AppText className="text-6xl font-bold text-gray-300">{'Demo 0123'}</AppText>
			<AppText className="text-6xl font-extrabold text-gray-400">{'Demo 0123'}</AppText>
			<AppText className="text-6xl font-black text-gray-500">{'Demo 0123'}</AppText>
		</View>
	)
}

export default withProfiler(Demo)
