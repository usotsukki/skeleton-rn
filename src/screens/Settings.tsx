import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	AppButton,
	AppText,
	Avatar,
	Card,
	ListGroup,
	ListRow,
	ScreenHeader,
	SectionHeader,
} from '@app/components/shared'
import useAuth, { useAuthStore } from '@app/hooks/useAuth'
import { type ThemeMode, useThemeStore } from '@app/store/themeStore'

const SCROLL_STYLE = { paddingBottom: 32 } as const

const LANGUAGE_LABELS: Record<string, string> = {
	en: 'English',
	es: 'Español',
}

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark']

export default function Settings() {
	const { t, i18n } = useTranslation()
	const router = useRouter()
	const user = useAuthStore(s => s.user)
	const { signOut, loading } = useAuth()
	const goBack = () => (router.canGoBack() ? router.back() : router.replace('/Home'))
	const displayName = user ? user.displayName : null
	const email = user ? user.email : null
	const profileTitle = displayName ?? t('homeScreen.defaultUser')

	const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2)
	const currentLangLabel = LANGUAGE_LABELS[currentLang] ?? currentLang.toUpperCase()

	const themeMode = useThemeStore(s => s.mode)
	const setThemeMode = useThemeStore(s => s.setMode)
	const themeModeLabel = t(`settingsScreen.theme.${themeMode}`)

	const showLanguagePicker = () => {
		Alert.alert(t('changeLanguage'), undefined, [
			{ text: 'English', onPress: () => i18n.changeLanguage('en') },
			{ text: 'Español', onPress: () => i18n.changeLanguage('es') },
			{ text: t('modules.common.cancel'), style: 'cancel' },
		])
	}

	const showThemePicker = () => {
		Alert.alert(t('settingsScreen.appearance'), undefined, [
			...THEME_MODES.map(mode => ({
				text: t(`settingsScreen.theme.${mode}`),
				onPress: () => setThemeMode(mode),
			})),
			{ text: t('modules.common.cancel'), style: 'cancel' as const },
		])
	}

	return (
		<SafeAreaView className="flex-1 bg-bg-grouped" edges={['top']}>
			<ScreenHeader
				leading={{ kind: 'back', onPress: goBack, a11yLabel: t('modules.common.close') }}
				title={t('settings')}
			/>
			<ScrollView contentContainerStyle={SCROLL_STYLE}>
				<View className="px-4 pt-2">
					<Card>
						<View className="flex-row items-center gap-4 p-5">
							<Avatar name={displayName ?? email} />
							<View className="flex-1">
								<AppText className="text-text" numberOfLines={1} variant="h3">
									{profileTitle}
								</AppText>
								<AppText className="text-text-muted" numberOfLines={1} variant="ts">
									{email}
								</AppText>
							</View>
						</View>
					</Card>
				</View>

				<SectionHeader title={t('settingsScreen.preferences')} />
				<View className="px-4">
					<ListGroup>
						<ListRow first onPress={showThemePicker} title={t('settingsScreen.appearance')} value={themeModeLabel} />
						<ListRow last onPress={showLanguagePicker} title={t('changeLanguage')} value={currentLangLabel} />
					</ListGroup>
				</View>

				<View className="mt-8 px-4">
					<AppButton fullWidth onPress={() => !loading && signOut()} variant="destructive">
						{t('signOut')}
					</AppButton>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
