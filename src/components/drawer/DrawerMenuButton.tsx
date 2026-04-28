import { DrawerActions, useNavigation } from '@react-navigation/native'
import { Menu } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useThemeColors } from '@app/theme/colors'

const SIZE = 40

export default function DrawerMenuButton() {
	const { t } = useTranslation()
	const navigation = useNavigation()
	const colors = useThemeColors()

	return (
		<Pressable
			accessibilityLabel={t('a11y.openMenu')}
			accessibilityRole="button"
			hitSlop={8}
			onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
			style={({ pressed }) => [
				{
					width: SIZE,
					height: SIZE,
					opacity: pressed ? 0.7 : 1,
					shadowColor: '#000',
					shadowOpacity: 0.18,
					shadowRadius: 10,
					shadowOffset: { width: 0, height: 4 },
					elevation: 6,
					justifyContent: 'center',
					alignItems: 'center',
				},
			]}
			testID="HeaderDrawerMenu">
			<Menu color={colors.text} size={20} strokeWidth={2.25} />
		</Pressable>
	)
}
