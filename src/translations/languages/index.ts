import en from './en.json'
import es from './es.json'

export type Translation = typeof en
export enum Language {
	EN = 'en',
	ES = 'es',
}

export const supportedLanguages: Record<Language, string> = {
	[Language.EN]: 'English',
	[Language.ES]: 'Español',
}

export const resources: Record<Language, Record<keyof typeof en, string>> = {
	es,
	en,
}
