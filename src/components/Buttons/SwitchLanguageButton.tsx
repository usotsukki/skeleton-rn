import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonProps } from 'react-native-ui-lib'
import { Language, supportedLanguages } from '@app/translations/languages'

const SwitchLanguageButton = ({ ...props }: ButtonProps) => {
	const { i18n } = useTranslation()
	return (
		<Button
			hyperlink
			label={supportedLanguages[i18n.language as Language]}
			onPress={() => i18n.changeLanguage(i18n.language === Language.EN ? Language.ES : Language.EN)}
			testID="switch-language-button"
			ts
			white
			{...props}
		/>
	)
}

export default SwitchLanguageButton
