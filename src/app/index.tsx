import { Redirect } from 'expo-router'
import { useAuthStore } from '@app/hooks/useAuth'

export default function Index() {
	const { user } = useAuthStore()
	return <Redirect href={user ? '/(tabs)/(home)/Home' : '/Welcome'} />
}
