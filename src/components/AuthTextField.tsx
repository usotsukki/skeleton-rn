import React from 'react'
import { StyleSheet } from 'react-native'
import { Spacings, TextField, TextFieldProps } from 'react-native-ui-lib'

interface Props {
	value: string
	onChangeText: (text: string) => void
	placeholder: string
}

const AuthTextField = ({ ...props }: Props & TextFieldProps) => {
	return (
		<TextField
			white
			floatingPlaceholder
			floatOnFocus
			placeholderTextColor-white
			floatingPlaceholderColor-white
			containerStyle={styles.inputContainer}
			{...props}
		/>
	)
}

const styles = StyleSheet.create({
	inputContainer: {
		width: 300,
		height: 44,
		borderRadius: 22,
		borderBottomWidth: 1,
		borderColor: 'white',
		paddingHorizontal: Spacings.s4,
	},
})

export default AuthTextField
