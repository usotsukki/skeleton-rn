import Entypo from '@expo/vector-icons/Entypo'
import MaskedView from '@react-native-masked-view/masked-view'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Image, View } from 'react-native-ui-lib'

const LanguageIconMask = () => {
	return (
		<MaskedView
			testID={'language-icon.container'}
			style={styles.maskContainer}
			maskElement={
				<View testID={'language-icon.mask'} style={styles.maskElement}>
					<Entypo name="language" size={300} />
				</View>
			}>
			<Image testID={'language-icon.image'} width={700} assetGroup="illustrations" assetName="graphicBackground" />
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
