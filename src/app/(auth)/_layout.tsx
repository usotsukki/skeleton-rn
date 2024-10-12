import { Slot } from 'expo-router'
import { Background } from '@app/components'

const AuthStackLayout = () => {
	return (
		<Background>
			<Slot />
		</Background>
	)
}
export default AuthStackLayout
