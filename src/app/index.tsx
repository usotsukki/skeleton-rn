import { Redirect } from 'expo-router'
import { useAuthStore } from '@app/hooks/useAuth'

export default () => {
	const { user } = useAuthStore()
	const isLoggedIn = !!user

	return <Redirect href={isLoggedIn ? '/(tabs)/(home)/Home' : '/Welcome'} />
}
