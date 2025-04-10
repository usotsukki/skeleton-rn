import { withProfiler } from '@sentry/react-native'
import { useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { Button, Text, View } from 'react-native-ui-lib'
import { AuthTextField, Background, LoaderModal, SignInButton } from '@app/components'
import { useAuth, useAvoidKeyboard } from '@app/hooks'
import useToast from '@app/hooks/useToast'
import { validateEmail } from '@app/utils/validators'

const SignUp = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })
	const router = useRouter()
	const { createUser, loading } = useAuth()
	const showToast = useToast(state => state.showToast)

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
		<Background>
			<ScrollView contentContainerStyle={styles.container} testID="SignUp">
				<View flex centerV paddingH-s6>
					<LoaderModal visible={loading} />
					<View bg-blackTransparent4 center gap-s4 style={styles.card}>
						<Text marginB-s10 tl white>
							{i18n.t('signUp')}
						</Text>
						<AuthTextField
							onChangeText={onChangeEmail}
							placeholder={capitalize(t('email'))}
							testID="SignUp.Email"
							validate={['required', validateEmail]}
							validationMessage={[i18n.t('error.required'), i18n.t('error.wrongEmailFormat')]}
							value={email}
						/>
						<AuthTextField
							onChangeText={onChangePassword}
							placeholder={capitalize(t('password'))}
							secureTextEntry
							testID="SignUp.Password"
							validate={['required', v => !!v && v.length >= 6]}
							validationMessage={[i18n.t('error.required'), i18n.t('error.shortPassword')]}
							value={password}
						/>
						<AuthTextField
							onChangeText={onChangeConfirmationPassword}
							placeholder={capitalize(t('confirmPassword'))}
							testID="SignUp.ConfirmationPassword"
							value={confirmationPassword}
						/>
						<SignInButton
							disabled={submitDisabled}
							label={t('signUpButton')}
							onPress={handleSubmit}
							testID="SignUp.SubmitButton"
						/>
						<Button hyperlink label={t('alreadyHaveAccountButton')} marginT-s4 onPress={router.back} tm white />
					</View>
				</View>
			</ScrollView>
		</Background>
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
