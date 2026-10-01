import TextField, { type TextFieldProps } from './TextField'

export function AuthEmailInput(props: TextFieldProps) {
	return (
		<TextField autoCapitalize="none" autoComplete="email" autoCorrect={false} keyboardType="email-address" {...props} />
	)
}
