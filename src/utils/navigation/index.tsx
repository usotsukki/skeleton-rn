import { Colors } from 'react-native-ui-lib'
import { HeaderBackButton } from '@app/components'
import { fonts, headingSizes } from '@app/theme'

export const stackHeaderScreenOptions = {
	headerStyle: {
		backgroundColor: Colors.primary,
	},
	headerTitleStyle: [
		{
			color: Colors.black,
			...headingSizes['23px / 27px'],
			...fonts.SFProRounded.bold,
		},
	],
	headerLeft: () => <HeaderBackButton />,
	headerTitleAlign: 'center' as 'center' | 'left' | undefined,
	headerTitleContainerStyle: {
		borderWidth: 1,
		paddingHorizontal: 30,
	},
}
