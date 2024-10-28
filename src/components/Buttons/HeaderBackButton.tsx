import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { Button } from 'react-native-ui-lib'
import { iconSizes } from '@app/theme/designSystem'

const HeaderBackButton = () => {
	const navigation = useNavigation()

	return navigation.getState().index > 0 ? (
		<Button
			backgroundColor={'transparent'}
			iconSource={() => <Ionicons color="black" name="arrow-back" size={iconSizes.medium} />}
			onPress={() => navigation.goBack()}
			testID="nav-back-button"
		/>
	) : null
}

export default HeaderBackButton
