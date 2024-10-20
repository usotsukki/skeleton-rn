import { withProfiler } from '@sentry/react-native'
import { scheduleNotificationAsync } from 'expo-notifications'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Button, Colors, Text, View } from 'react-native-ui-lib'
import { useAuth, useJokes } from '@app/hooks'

const Demo = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.demoScreen' })
	const { signOut } = useAuth()
	const jokeQuery = useJokes()

	const scheduleNotification = async () => {
		await scheduleNotificationAsync({
			content: {
				title: t('jokeOfTheDay'),
				body: jokeQuery.data,
			},
			trigger: null,
		})
		jokeQuery.refetch()
	}

	return (
		<View flex center backgroundColor={Colors.grayBlack} testID="Demo" gap-s4>
			<Link href="/(demo)/Map">
				<Text h1 white>
					{t('navigateToMap')}
				</Text>
			</Link>
			<Button label={t('getRandomJoke')} onPress={scheduleNotification} />
			<Button label={i18n.t('modules.auth.signOut')} onPress={signOut} testID="Demo.SignOutButton" />
		</View>
	)
}

export default withProfiler(Demo)
