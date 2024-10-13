import LottieView from 'lottie-react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Assets, Button, Text, View } from 'react-native-ui-lib'
import { IS_DEV } from '@app/env'

interface Props {
	error: Error
	resetErrorBoundary: () => void
}

const ErrorFallback = ({ error, resetErrorBoundary }: Props) => {
	const { t } = useTranslation()

	return (
		<View flex center>
			<View br60 bg-blackTransparent4 center paddingH-s5 paddingV-s10 gap-s4 width={400}>
				<LottieView style={styles.mainAnimation} source={Assets.lottie.robot404} autoPlay />
				<View>
					<Text white h1 marginB-s2 center>
						{t('error.title')}
					</Text>
					<Text white tl marginB-s2 center>
						{t('error.subtitle')}
					</Text>
					{error?.message && IS_DEV && (
						<Text white marginT-s4 ts center>
							{error.message}
						</Text>
					)}
				</View>
				<Button label={t('error.button')} onPress={resetErrorBoundary} bg-primary tl style={styles.buttonContainer} />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	mainAnimation: { height: 300, aspectRatio: 1 },
	buttonContainer: { width: 200, height: 42 },
})

export default ErrorFallback
