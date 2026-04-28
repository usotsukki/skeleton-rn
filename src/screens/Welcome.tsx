import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppButton, AppText } from '@app/components/shared'

export default function Welcome() {
	const { t } = useTranslation()
	const router = useRouter()
	const displayName = Constants.expoConfig?.name ?? 'App'

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
			<View className="flex-1 items-center justify-center gap-4 px-6">
				<AppText className="text-accent" variant="disp">
					{displayName}
				</AppText>
				<AppText className="text-center text-text-secondary" variant="tl">
					{t('modules.auth.welcomeSubtitle')}
				</AppText>
			</View>
			<View className="gap-3 px-6 pb-6">
				<AppButton fullWidth onPress={() => router.push('/SignUp')}>
					{t('signUp')}
				</AppButton>
				<AppButton fullWidth onPress={() => router.push('/SignIn')} variant="secondary">
					{t('signIn')}
				</AppButton>
			</View>
		</SafeAreaView>
	)
}
