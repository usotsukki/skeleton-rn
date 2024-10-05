import 'i18next'
import en from '@app/translations/languages/en.json'

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: { translation: typeof en }
	}
}
