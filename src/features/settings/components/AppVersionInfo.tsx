import * as Application from 'expo-application'
import * as Clipboard from 'expo-clipboard'
import * as Updates from 'expo-updates'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import useToast from '@app/shared/hooks/useToast'
import { AppButton, AppText, Popover, PopoverContent, PopoverTrigger } from '@app/shared/ui'

// Store version of the installed binary, with its build number when the platform reports one.
const APP_VERSION = Application.nativeApplicationVersion ?? '0.0.0'
const BUILD = Application.nativeBuildVersion
const VERSION_LABEL = BUILD ? `${APP_VERSION} (${BUILD})` : APP_VERSION

/**
 * The app version; tapping it shows which JS bundle is running. The update id matches the EAS
 * dashboard (expo.dev → Updates); without one the app runs the bundle embedded in the build.
 */
export function AppVersionInfo() {
	const { t, i18n } = useTranslation()
	const showToast = useToast(s => s.showToast)
	const updateId = Updates.isEmbeddedLaunch ? null : Updates.updateId
	const published = updateId && Updates.createdAt ? Updates.createdAt.toLocaleString(i18n.language) : null
	const details = [
		Updates.channel ? `${t('settingsScreen.version.channel')}: ${Updates.channel}` : null,
		Updates.runtimeVersion ? `${t('settingsScreen.version.runtime')}: ${Updates.runtimeVersion}` : null,
	].filter(Boolean)

	const copyUpdateId = async () => {
		if (!updateId) return
		await Clipboard.setStringAsync(updateId)
		showToast(t('settingsScreen.version.copied'), 'success')
	}

	return (
		<Popover>
			<PopoverTrigger
				accessibilityHint={t('settingsScreen.version.hint')}
				accessibilityLabel={t('settingsScreen.version.label', { version: VERSION_LABEL })}
				accessibilityRole="button"
				className="min-h-[48px] items-center justify-center self-center px-4"
				testID="app-version">
				<AppText className="text-text-muted" variant="cap">
					{VERSION_LABEL}
				</AppText>
			</PopoverTrigger>
			<PopoverContent className="max-w-[300px]" side="top">
				<View className="gap-1" testID="app-update-info">
					<AppText className="text-text" variant="cap">
						{updateId ? `${t('settingsScreen.version.update')}: ${updateId}` : t('settingsScreen.version.embedded')}
					</AppText>
					{published ? (
						<AppText className="text-text-secondary" variant="cap">
							{`${t('settingsScreen.version.published')}: ${published}`}
						</AppText>
					) : null}
					{details.map(line => (
						<AppText className="text-text-secondary" key={line} variant="cap">
							{line}
						</AppText>
					))}
					{updateId ? (
						<AppButton onPress={copyUpdateId} testID="app-update-copy" variant="link">
							{t('settingsScreen.version.copy')}
						</AppButton>
					) : null}
				</View>
			</PopoverContent>
		</Popover>
	)
}
