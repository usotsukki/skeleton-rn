import i18next from 'i18next'
import { Alert } from 'react-native'
import { captureRepoError } from './sentry/captureRepoError'

/**
 * Shows a native error Alert for a failed operation. `title` is the caller's user-facing message;
 * the body is a generic string, never `err.message` (it leaks internals such as Postgres constraint
 * names). The raw error goes to the console and Sentry for diagnostics.
 */
export function showOperationErrorAlert(title: string, err: unknown) {
	if (err !== undefined) {
		console.warn('[operation error]', title, err)
		captureRepoError(err)
	}
	Alert.alert(title, i18next.t('modules.common.somethingWentWrong'))
}
