import { withProfiler } from '@sentry/react-native'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Colors, Text, View } from 'react-native-ui-lib'

const Demo = () => {
	const { t } = useTranslation('translation', { keyPrefix: 'demoScreen' })

	return (
		<View flex center backgroundColor={Colors.grayBlack}>
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
		</View>
	)
}

export default withProfiler(Demo)
