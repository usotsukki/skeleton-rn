import { getLocales } from 'expo-localization'
import i18next from 'i18next'
import 'intl-pluralrules'
import { initReactI18next } from 'react-i18next'
import { TRANSLATIONS_DEBUG } from '@app/env'
import { deviceStorage } from '@app/storage'
import { Language, resources, supportedLanguages } from './languages'

const getUserPreferredLanguage = (): Language | null => {
	const userLanguages = getLocales().map(locale => locale.languageCode)
	return userLanguages.find(lng => lng && supportedLanguages[lng as Language]) as Language | null
}

const getInitLanguage = (): Language => {
	const savedLanguage = deviceStorage.get(['language'])
	return savedLanguage || getUserPreferredLanguage() || Language.EN
}

i18next.use(initReactI18next).init({
	lng: getInitLanguage(),
	fallbackLng: Language.EN,
	debug: TRANSLATIONS_DEBUG,
	resources: Object.keys(resources).reduce((a, b) => ({ ...a, [b]: { translation: resources[b as Language] } }), {}),
})

i18next.on('languageChanged', lng => {
	deviceStorage.set(['language'], lng as Language)
})
