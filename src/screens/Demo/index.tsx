import { withProfiler } from '@sentry/react-native'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Button, Colors, Text, View } from 'react-native-ui-lib'
import { useAuth } from '@app/hooks'

const Demo = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.demoScreen' })
	const { signOut } = useAuth()

	return (
		<View flex center backgroundColor={Colors.grayBlack} testID="Demo">
			<Link href="/(demo)/Map">
				<Text h1 white>
					{t('navigateToMap')}
				</Text>
			</Link>
			<Link href="/(demo)/GraphicsList">
				<Text h1 white>
					{t('navigateToGraphicsList')}
				</Text>
			</Link>
			<Button label={i18n.t('modules.auth.signOut')} onPress={signOut} testID="Demo.SignOutButton" />
		</View>
	)
}

export default withProfiler(Demo)
