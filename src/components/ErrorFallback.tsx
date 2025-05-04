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
		<View flex bg-darkGrayBlue center paddingH-s5>
			<View bg-blackTransparent4 br60 center gap-s4 paddingH-s5 paddingV-s10>
				<LottieView autoPlay source={Assets.lottie.robot404} style={styles.mainAnimation} />
				<View>
					<Text center h1 marginB-s2 white>
						{t('error.title')}
					</Text>
					<Text center marginB-s2 tl white>
						{t('error.subtitle')}
					</Text>
					{error?.message && IS_DEV && (
						<Text center marginT-s4 ts white>
							{error.message}
						</Text>
					)}
				</View>
				<Button bg-primary label={t('error.button')} onPress={resetErrorBoundary} style={styles.buttonContainer} tl />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	mainAnimation: { height: 300, aspectRatio: 1 },
	buttonContainer: { width: 200, height: 42 },
})

export default ErrorFallback
