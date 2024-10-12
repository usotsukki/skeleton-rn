import { useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { Button, Text, View } from 'react-native-ui-lib'
import { AuthTextField, LoaderModal, SignInButton } from '@app/components'
import { useAuth, useAvoidKeyboard } from '@app/hooks'

const SignUp = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })
	const router = useRouter()
	const { createUser, loading } = useAuth()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmationPassword, setConfirmationPassword] = useState('')
	const submitDisabled = useMemo(
		() => !email || !password || !confirmationPassword,
		[email, password, confirmationPassword],
	)

	const onChangeEmail = (text: string) => setEmail(text)
	const onChangePassword = (text: string) => setPassword(text)
	const onChangeConfirmationPassword = (text: string) => setConfirmationPassword(text)

	const handleSubmit = async () => {
		if (!email || !password || password !== confirmationPassword) return
		createUser(email, password)
	}

	useAvoidKeyboard()

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View flex paddingH-s6 centerV>
				<LoaderModal visible={loading} />
				<View center gap-s4 style={styles.card}>
					<Text tl white marginB-s10>
						{i18n.t('signUp')}
					</Text>
					<AuthTextField placeholder={capitalize(t('email'))} value={email} onChangeText={onChangeEmail} />
					<AuthTextField
						value={password}
						onChangeText={onChangePassword}
						placeholder={capitalize(t('password'))}
						secureTextEntry
						textContentType="newPassword"
					/>
					<AuthTextField
						value={confirmationPassword}
						onChangeText={onChangeConfirmationPassword}
						placeholder={capitalize(t('confirmPassword'))}
						secureTextEntry
						textContentType="newPassword"
					/>
					<SignInButton label={t('signUpButton')} onPress={handleSubmit} disabled={submitDisabled} />
					<Button label={t('noAccountButton')} onPress={router.back} tm hyperlink white marginT-s4 />
				</View>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	card: {
		borderRadius: 36,
		height: 450,
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
})

export default SignUp
