import { useTranslation } from 'react-i18next'
import { Colors, Text, View } from 'react-native-ui-lib'

const Demo = () => {
	const { t } = useTranslation()
	return (
		<View flex center backgroundColor={Colors.grayBlack}>
			<Text h1 white>
				{t('demo')}
			</Text>
		</View>
	)
}

export default Demo
