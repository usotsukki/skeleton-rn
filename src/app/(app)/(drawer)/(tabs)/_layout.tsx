import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'
import { darkColors, lightColors, useThemeColors } from '@app/theme/colors'

const isIOS = Platform.OS === 'ios'
const dyn = (light: string, dark: string) => (isIOS ? DynamicColorIOS({ light, dark }) : null)

export default function TabsLayout() {
	const { t } = useTranslation()
	const colors = useThemeColors()
	const tintColor = dyn(lightColors.accent, darkColors.accent) ?? colors.accent
	const labelColor = dyn(lightColors.text, darkColors.text) ?? colors.text

	return (
		<NativeTabs
			backgroundColor={colors.bg}
			disableIndicator
			labelStyle={{ color: labelColor }}
			labelVisibilityMode="unlabeled"
			minimizeBehavior={isIOS ? 'onScrollDown' : undefined}
			tintColor={tintColor}>
			<NativeTabs.Trigger disableAutomaticContentInsets name="Home">
				<NativeTabs.Trigger.Icon md="home" sf={{ default: 'house', selected: 'house.fill' }} />
				<NativeTabs.Trigger.Label hidden>{t('home')}</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="Map">
				<NativeTabs.Trigger.Icon md="map" sf={{ default: 'map', selected: 'map.fill' }} />
				<NativeTabs.Trigger.Label hidden>{t('map')}</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="Skia">
				<NativeTabs.Trigger.Icon
					md="auto_awesome"
					sf={{ default: 'sparkles', selected: 'sparkles.rectangle.stack.fill' }}
				/>
				<NativeTabs.Trigger.Label hidden>{t('skia')}</NativeTabs.Trigger.Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	)
}
