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
			containerStyle={styles.inputContainer}
			enableErrors
			floatingPlaceholder
			floatingPlaceholderColor-white
			floatOnFocus
			placeholderTextColor-white
			retainValidationSpace
			validateOnBlur
			validationMessagePosition="top"
			validationMessageStyle={styles.validationMessageStyle}
			white
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
	validationMessageStyle: {
		fontSize: 12,
		lineHeight: 16,
	},
})

export default AuthTextField
