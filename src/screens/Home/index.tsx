import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Button, Colors, Text, View } from 'react-native-ui-lib'
import { magicMemo } from '@app/utils'

const Home = () => {
	return (
		<View flex center backgroundColor={Colors.grayBlack}>
			<LanguageText />
			<ChangeLanguageButton />
		</View>
	)
}

export default Home

const ChangeLanguageButton = magicMemo(() => {
	const { t, i18n } = useTranslation()
	const changeLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')

	return <Button label={t('changeLanguage')} onPress={changeLanguage} marginV-10 />
}, [])

const LanguageText = magicMemo(() => {
	const { i18n } = useTranslation()
	const language = i18n.language
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

	return (
		<View reanimated style={animatedStyle}>
			<Text h1 white>
				{language}
			</Text>
		</View>
	)
}, [])
