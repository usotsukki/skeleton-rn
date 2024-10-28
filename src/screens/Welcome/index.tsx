import { withProfiler } from '@sentry/react-native'
import * as Application from 'expo-application'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Colors, Text, View } from 'react-native-ui-lib'
import { Background, LoaderModal, Logo, SignInButton, SwitchLanguageButton } from '@app/components'
import { IS_IOS } from '@app/env'
import { useAuth } from '@app/hooks'

const Welcome = () => {
	const router = useRouter()
	const { t, i18n } = useTranslation('translation', { keyPrefix: 'modules.auth' })

	const { signInWithGoogle, signInWithApple, loading } = useAuth()

	const navigateToSignIn = () => router.push('/SignIn')
	const navigateToSignUp = () => router.push('/SignUp')

	return (
		<Background center gap-s10 testID="Welcome">
			<LoaderModal visible={loading} />
			<Logo />
			<Text center title white>
				{t('welcome', { appName: Application.applicationName })}
			</Text>
			<View gap-s3>
				<SignInButton onPress={navigateToSignIn} testID="Welcome.SignIn" />
				<SignInButton authProvider="google" onPress={signInWithGoogle} testID="Welcome.GoogleSignIn" />
				{IS_IOS && <SignInButton authProvider="apple" onPress={signInWithApple} testID="Welcome.AppleSignIn" />}
				<Text center white>
					{i18n.t('or')}
				</Text>
				<SignInButton
					outline={true}
					label={t('signUpButton')}
					onPress={navigateToSignUp}
					outlineColor={Colors.primary}
					testID="Welcome.SignUpButton"
					white
				/>
			</View>
			<SwitchLanguageButton testID="Welcome.SwitchLanguage" />
		</Background>
	)
}
export default withProfiler(Welcome)
