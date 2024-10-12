import { withProfiler } from '@sentry/react-native'
import * as Application from 'expo-application'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Colors, Text, View } from 'react-native-ui-lib'
import { LoaderModal, Logo, SignInButton, SwitchLanguageButton } from '@app/components'
import { useAuth } from '@app/hooks'

const Welcome = () => {
	const router = useRouter()
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })

	const { signInWithGoogle, signInWithApple, loading } = useAuth()

	const navigateToSignIn = () => router.push('/(auth)/SignIn')
	const navigateToSignUp = () => router.push('/(auth)/SignUp')

	return (
		<View flex center gap-s10>
			<LoaderModal visible={loading} />
			<Logo />
			<Text title white center>
				{t('welcome', { appName: Application.applicationName })}
			</Text>
			<View gap-s3>
				<SignInButton onPress={navigateToSignIn} />
				<SignInButton onPress={signInWithGoogle} authProvider="google" />
				<SignInButton onPress={signInWithApple} authProvider="apple" />
				<Text white center>
					{i18n.t('or')}
				</Text>
				<SignInButton
					label={t('signUpButton')}
					onPress={navigateToSignUp}
					white
					outline={true}
					outlineColor={Colors.primary}
				/>
			</View>
			<SwitchLanguageButton />
		</View>
	)
}
export default withProfiler(Welcome)
