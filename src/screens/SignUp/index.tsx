import { withProfiler } from '@sentry/react-native'
import { useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { Button, Text, View } from 'react-native-ui-lib'
import { AuthTextField, LoaderModal, SignInButton } from '@app/components'
import { useAuth, useAvoidKeyboard } from '@app/hooks'
import { useStore } from '@app/store'
import { validateEmail } from '@app/utils/validators'

const SignUp = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })
	const router = useRouter()
	const { createUser, loading } = useAuth()
	const { showToast } = useStore()

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
		if (!validateEmail(email)) {
			showToast(i18n.t('error.wrongEmailFormat'), 'error')
			return
		}
		if (password.length < 6) {
			showToast(i18n.t('error.shortPassword'), 'error')
			return
		}
		if (password !== confirmationPassword) {
			showToast(i18n.t('error.passwordsDoNotMatch'), 'error')
			return
		}

		createUser(email, password)
	}

	useAvoidKeyboard()

	return (
		<ScrollView contentContainerStyle={styles.container} testID="SignUp">
			<View flex paddingH-s6 centerV>
				<LoaderModal visible={loading} />
				<View center gap-s4 bg-blackTransparent4 style={styles.card}>
					<Text tl white marginB-s10>
						{i18n.t('signUp')}
					</Text>
					<AuthTextField
						placeholder={capitalize(t('email'))}
						value={email}
						onChangeText={onChangeEmail}
						validate={['required', validateEmail]}
						validationMessage={[i18n.t('error.required'), i18n.t('error.wrongEmailFormat')]}
						testID="SignUp.Email"
					/>
					<AuthTextField
						value={password}
						onChangeText={onChangePassword}
						placeholder={capitalize(t('password'))}
						validate={['required', v => !!v && v.length >= 6]}
						validationMessage={[i18n.t('error.required'), i18n.t('error.shortPassword')]}
						secureTextEntry
						testID="SignUp.Password"
					/>
					<AuthTextField
						value={confirmationPassword}
						onChangeText={onChangeConfirmationPassword}
						placeholder={capitalize(t('confirmPassword'))}
						testID="SignUp.ConfirmationPassword"
					/>
					<SignInButton
						label={t('signUpButton')}
						onPress={handleSubmit}
						disabled={submitDisabled}
						testID="SignUp.SubmitButton"
					/>
					<Button label={t('alreadyHaveAccountButton')} onPress={router.back} tm hyperlink white marginT-s4 />
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
	},
})

export default withProfiler(SignUp)
