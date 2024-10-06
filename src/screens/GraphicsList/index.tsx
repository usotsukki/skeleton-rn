import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { LanguageIconMask } from '@app/components'

export default () => {
	return (
		<ScrollView
			contentContainerStyle={StyleSheet.create({ container: { backgroundColor: Colors.grayBlack } }).container}>
			<LanguageIconMask />
		</ScrollView>
	)
}
