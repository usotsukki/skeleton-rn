import Entypo from '@expo/vector-icons/Entypo'
import MaskedView from '@react-native-masked-view/masked-view'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Image, View } from 'react-native-ui-lib'

const LanguageIconMask = () => {
	return (
		<MaskedView
			maskElement={
				<View style={styles.maskElement} testID={'language-icon.mask'}>
					<Entypo name="language" size={300} />
				</View>
			}
			style={styles.maskContainer}
			testID={'language-icon.container'}>
			<Image width={700} assetGroup="illustrations" assetName="graphicBackground" testID={'language-icon.image'} />
		</MaskedView>
	)
}

const styles = StyleSheet.create({
	maskContainer: { flex: 1, flexDirection: 'row', height: '100%', justifyContent: 'center', alignItems: 'center' },
	maskElement: {
		flex: 1,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
	},
})

export default LanguageIconMask
