import { Ionicons } from '@expo/vector-icons'
import { capitalize } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Button, ButtonProps, Colors, View } from 'react-native-ui-lib'

type AuthProvider = 'google' | 'apple' | 'facebook' | 'instagram' | 'twitter' | 'github' | 'linkedin'

interface Props {
	authProvider?: AuthProvider
	onPress: () => void
}

const SignInButton = ({ onPress, authProvider, ...props }: Props & ButtonProps) => {
	const { t } = useTranslation('translation', { keyPrefix: 'modules.auth' })

	const label = authProvider ? t('signInWith', { provider: capitalize(authProvider) }) : t('signInButton')

	const renderProviderIcon = () => (
		<View style={styles.iconContainer}>
			<Ionicons color="black" name={authProvider && `logo-${authProvider}`} size={24} />
		</View>
	)

	return (
		<Button
			bg-primary
			iconSource={authProvider && renderProviderIcon}
			label={label}
			onPress={onPress}
			style={styles.button}
			testID="sign-in-button"
			tm
			{...props}
		/>
	)
}

const styles = StyleSheet.create({
	iconContainer: {
		width: 40,
		aspectRatio: 1,
		borderRadius: 20,
		backgroundColor: Colors.grey50,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		left: 4,
	},
	button: {
		width: 300,
		height: 48,
		alignSelf: 'center',
	},
})

export default SignInButton
