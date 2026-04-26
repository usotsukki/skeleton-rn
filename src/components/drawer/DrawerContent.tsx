import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppText, Avatar } from '@app/components/shared'
import useAuth, { useAuthStore } from '@app/hooks/useAuth'

interface DrawerLinkProps {
	label: string
	onPress: () => void
}

function DrawerLink({ label, onPress }: DrawerLinkProps) {
	return (
		<Pressable accessibilityRole="button" className="rounded-xl px-4 py-3 active:bg-bg-elevated" onPress={onPress}>
			<AppText className="text-text" variant="tmed">
				{label}
			</AppText>
		</Pressable>
	)
}

export function DrawerContent(_: DrawerContentComponentProps) {
	const { t } = useTranslation()
	const router = useRouter()
	const { signOut, loading } = useAuth()
	const user = useAuthStore(s => s.user)
	const displayName = user ? user.displayName : null
	const email = user ? user.email : null
	const avatarLabel = displayName ?? email

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
			<DrawerContentScrollView contentContainerStyle={{ paddingTop: 0 }}>
				<View className="mb-2 flex-row items-center gap-3 border-b border-separator px-5 py-5">
					<Avatar name={avatarLabel} size={48} />
					<View className="flex-1">
						<AppText className="text-text" numberOfLines={1} variant="tmed">
							{displayName ?? t('homeScreen.defaultUser')}
						</AppText>
						<AppText className="text-text-muted" numberOfLines={1} variant="cap">
							{email}
						</AppText>
					</View>
				</View>

				<View className="px-2 py-2">
					<DrawerLink label={t('home')} onPress={() => router.push('/Home')} />
					<DrawerLink label={t('map')} onPress={() => router.push('/Map')} />
					<DrawerLink label={t('skia')} onPress={() => router.push('/Skia')} />
				</View>

				<View className="border-t border-separator px-2 pt-4">
					<DrawerLink label={t('settings')} onPress={() => router.push('/Settings')} />
				</View>
			</DrawerContentScrollView>

			<View className="border-t border-separator px-2 pb-2 pt-2">
				<Pressable
					accessibilityRole="button"
					className="rounded-xl px-4 py-3 active:bg-bg-elevated"
					disabled={loading}
					onPress={() => signOut()}>
					<AppText className="text-danger" variant="tmed">
						{t('signOut')}
					</AppText>
				</Pressable>
			</View>
		</SafeAreaView>
	)
}
