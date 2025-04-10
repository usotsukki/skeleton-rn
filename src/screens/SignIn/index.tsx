import { withProfiler } from '@sentry/react-native'
import { useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { Button, Text, View } from 'react-native-ui-lib'
import { AuthTextField, Background, LoaderModal, SignInButton } from '@app/components'
import { IS_DEV } from '@app/env'
import { useAuth, useAvoidKeyboard } from '@app/hooks'
import useToast from '@app/hooks/useToast'
import { validateEmail } from '@app/utils/validators'

const defaultEmail = IS_DEV ? 'user@example.com' : ''
const defaultPassword = IS_DEV ? 'password' : ''

const SignIn = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })
	const router = useRouter()
	const { signIn, loading } = useAuth()
	const showToast = useToast(state => state.showToast)

	const [email, setEmail] = useState(defaultEmail)
	const [password, setPassword] = useState(defaultPassword)
	const submitDisabled = useMemo(() => !email || !password, [email, password])

	const onChangeEmail = (text: string) => setEmail(text)
	const onChangePassword = (text: string) => setPassword(text)

	const handleSubmit = async () => {
		if (!validateEmail(email)) {
			showToast(i18n.t('error.wrongEmailFormat'), 'error')
			return
		}

		signIn(email, password)
	}

	useAvoidKeyboard()

	return (
		<Background>
			<ScrollView contentContainerStyle={styles.container} testID="SignIn">
				<View flex centerV paddingH-s6>
					<LoaderModal visible={loading} />
					<View bg-blackTransparent4 center gap-s4 style={styles.card}>
						<Text marginB-s10 tl white>
							{i18n.t('signIn')}
						</Text>
						<AuthTextField
							onChangeText={onChangeEmail}
							placeholder={capitalize(t('email'))}
							testID="SignIn.Email"
							textContentType="emailAddress"
							validate={['required', validateEmail]}
							validationMessage={[i18n.t('error.required'), i18n.t('error.wrongEmailFormat')]}
							value={email}
						/>
						<AuthTextField
							onChangeText={onChangePassword}
							placeholder={capitalize(t('password'))}
							secureTextEntry
							testID="SignIn.Password"
							textContentType="password"
							value={password}
						/>
						<SignInButton disabled={submitDisabled} onPress={handleSubmit} testID="SignIn.SubmitButton" />
						<Button hyperlink label={t('noAccountButton')} marginT-s4 onPress={router.back} tm white />
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
		height: 400,
	},
})

export default withProfiler(SignIn)
