import type { NativeStackNavigationOptions } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StatusBar, View } from 'react-native'
import { AppText } from '@app/components/shared'
import { useThemeColors } from '@app/theme/colors'

const isAndroid = Platform.OS === 'android'

const ANDROID_TOP_PAD = 0
const ANDROID_ROW_HEIGHT = 56
const ANDROID_SIDE_SLOT = 56
const androidStatusBar = StatusBar.currentHeight ?? 0

/**
 * Header options for a tab's stack. `headerLeft` (e.g. the drawer button) shows on the stack's root
 * screen only; pushed screens get a back button instead.
 */
export function useTabStackScreenOptions(headerLeft: () => ReactNode): NativeStackNavigationOptions {
	const colors = useThemeColors()
	const { t } = useTranslation()

	if (isAndroid) {
		return {
			header: ({ options, back, navigation }) => (
				<View
					style={{
						backgroundColor: colors.bg,
						paddingTop: androidStatusBar + ANDROID_TOP_PAD,
					}}>
					<View
						style={{
							height: ANDROID_ROW_HEIGHT,
							flexDirection: 'row',
							alignItems: 'center',
							paddingHorizontal: 12,
						}}>
						<View style={{ width: ANDROID_SIDE_SLOT, alignItems: 'flex-start' }}>
							{back ? (
								<Pressable
									accessibilityLabel={t('a11y.back')}
									accessibilityRole="button"
									onPress={() => navigation.goBack()}
									style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}>
									<ChevronLeft color={colors.text} size={26} />
								</Pressable>
							) : (
								headerLeft()
							)}
						</View>
						<View style={{ flex: 1, alignItems: 'center' }}>
							<AppText style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{options.title ?? ''}</AppText>
						</View>
						<View style={{ width: ANDROID_SIDE_SLOT }} />
					</View>
				</View>
			),
		}
	}

	return {
		headerTransparent: true,
		headerStyle: { backgroundColor: 'transparent' },
		headerShadowVisible: false,
		headerTitleStyle: { color: colors.text, fontSize: 22, fontWeight: '700' },
		// Returning null on a pushed screen keeps the native back button.
		headerLeft: ({ canGoBack }) => (canGoBack ? null : headerLeft()),
	}
}
