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
			...headingSizes['26px / 30px'],
			...fonts.SFProRounded.bold,
		},
	],
	headerLeft: () => <HeaderBackButton />,
}
