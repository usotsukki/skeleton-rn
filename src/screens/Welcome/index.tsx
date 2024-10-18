import { withProfiler } from '@sentry/react-native'
import * as Application from 'expo-application'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Colors, Text, View } from 'react-native-ui-lib'
import { LoaderModal, Logo, SignInButton, SwitchLanguageButton } from '@app/components'
import { IS_IOS } from '@app/env'
import { useAuth } from '@app/hooks'

const Welcome = () => {
	const router = useRouter()
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })

	const { signInWithGoogle, signInWithApple, loading } = useAuth()

	const navigateToSignIn = () => router.push('/(auth)/SignIn')
	const navigateToSignUp = () => router.push('/(auth)/SignUp')

	return (
		<View flex center gap-s10 testID="Welcome">
			<LoaderModal visible={loading} />
			<Logo />
			<Text title white center>
				{t('welcome', { appName: Application.applicationName })}
			</Text>
			<View gap-s3>
				<SignInButton onPress={navigateToSignIn} testID="Welcome.SignIn" />
				<SignInButton onPress={signInWithGoogle} authProvider="google" testID="Welcome.GoogleSignIn" />
				{IS_IOS && <SignInButton onPress={signInWithApple} authProvider="apple" testID="Welcome.AppleSignIn" />}
				<Text white center>
					{i18n.t('or')}
				</Text>
				<SignInButton
					label={t('signUpButton')}
					testID="Welcome.SignUpButton"
					onPress={navigateToSignUp}
					white
					outline={true}
					outlineColor={Colors.primary}
				/>
			</View>
			<SwitchLanguageButton testID="Welcome.SwitchLanguage" />
		</View>
	)
}
export default withProfiler(Welcome)
