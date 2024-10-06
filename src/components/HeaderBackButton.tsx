import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { Button } from 'react-native-ui-lib'
import { iconSizes } from '@app/theme/designSystem'

const HeaderBackButton = () => {
	const navigation = useNavigation()

	return navigation.getState().index > 0 ? (
		<Button
			testID="nav-back-button"
			backgroundColor={'transparent'}
			onPress={() => navigation.goBack()}
			iconSource={() => <Ionicons name="arrow-back" size={iconSizes.medium} color="black" />}
		/>
	) : null
}

export default HeaderBackButton
