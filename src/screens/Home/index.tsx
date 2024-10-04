import { useEffect } from 'react'
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Button, Colors, Text, View } from 'react-native-ui-lib'
import { selectLanguage, selectLanguageSelector, useStore } from '@app/store'
import { logger, magicMemo } from '@app/utils'

const Home = () => {
	const language = useStore(selectLanguage)
	logger.debug('Home rendered')
	return (
		<View flex center backgroundColor={Colors.grayBlack}>
			<LanguageText language={language} />
			<ChangeLanguageButton />
		</View>
	)
}

export default Home

const ChangeLanguageButton = magicMemo(() => {
	const changeLanguage = useStore(selectLanguageSelector)
	logger.debug('change language rendered')

	return <Button label="Change language" onPress={changeLanguage} marginV-10 />
}, [])

const LanguageText = magicMemo<{ language: string }>(
	({ language }: { language: string }) => {
		const scale = useSharedValue(1)
		useEffect(() => {
			scale.value = withSpring(1.1)
			setTimeout(() => {
				scale.value = withSpring(1)
			}, 200)
		}, [language])

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ scale: scale.value }],
		}))
		logger.debug('language text rendered')
		return (
			<View reanimated style={animatedStyle}>
				<Text h1 white>
					{language}
				</Text>
			</View>
		)
	},
	['language'],
)
