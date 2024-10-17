import { useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { Button, Text, View } from 'react-native-ui-lib'
import { AuthTextField, LoaderModal, SignInButton } from '@app/components'
import { IS_DEV } from '@app/env'
import { useAuth, useAvoidKeyboard } from '@app/hooks'
import { useStore } from '@app/store'
import { validateEmail } from '@app/utils/validators'

const defaultEmail = IS_DEV ? 'user@example.com' : ''
const defaultPassword = IS_DEV ? 'password' : ''

const SignIn = () => {
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })
	const router = useRouter()
	const { signIn, loading } = useAuth()
	const { showToast } = useStore()

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
		<ScrollView contentContainerStyle={styles.container}>
			<View flex paddingH-s6 centerV>
				<LoaderModal visible={loading} />
				<View center gap-s4 bg-blackTransparent4 style={styles.card}>
					<Text tl white marginB-s10>
						{i18n.t('signIn')}
					</Text>
					<AuthTextField
						placeholder={capitalize(t('email'))}
						textContentType="emailAddress"
						value={email}
						onChangeText={onChangeEmail}
						validate={['required', validateEmail]}
						validationMessage={[i18n.t('error.required'), i18n.t('error.wrongEmailFormat')]}
					/>
					<AuthTextField
						value={password}
						onChangeText={onChangePassword}
						placeholder={capitalize(t('password'))}
						secureTextEntry
						textContentType="password"
					/>
					<SignInButton onPress={handleSubmit} disabled={submitDisabled} />
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
		height: 400,
	},
})

export default SignIn
