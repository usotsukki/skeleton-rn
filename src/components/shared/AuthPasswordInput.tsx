import TextField, { type TextFieldProps } from './TextField'

export function AuthPasswordInput(props: TextFieldProps) {
	return (
		<TextField
			autoCapitalize="none"
			autoComplete="off"
			autoCorrect={false}
			secureTextEntry
			textContentType="oneTimeCode"
			{...props}
		/>
	)
}
