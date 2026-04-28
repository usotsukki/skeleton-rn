import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import type { ReactNode } from 'react'
import { Platform, StatusBar, View } from 'react-native'
import { AppText } from '@app/components/shared'
import { useThemeColors } from '@app/theme/colors'

const isAndroid = Platform.OS === 'android'

const ANDROID_TOP_PAD = 0
const ANDROID_ROW_HEIGHT = 56
const ANDROID_SIDE_SLOT = 56
const androidStatusBar = StatusBar.currentHeight ?? 0

export function useTabStackScreenOptions(headerLeft: () => ReactNode): NativeStackNavigationOptions {
	const colors = useThemeColors()

	if (isAndroid) {
		return {
			header: ({ options }) => (
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
						<View style={{ width: ANDROID_SIDE_SLOT, alignItems: 'flex-start' }}>{headerLeft()}</View>
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
		headerLeft,
	}
}
