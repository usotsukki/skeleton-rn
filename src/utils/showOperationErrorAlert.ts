import i18next from 'i18next'
import { Alert } from 'react-native'

/**
 * Shows a native error Alert for a failed operation. Extracts the error message
 * if `err` is an `Error`, otherwise falls back to a generic i18n string.
 */
export function showOperationErrorAlert(title: string, err: unknown) {
	const fallback = i18next.t('modules.common.somethingWentWrong')
	const message = err instanceof Error ? err.message : fallback
	Alert.alert(title, message)
}
