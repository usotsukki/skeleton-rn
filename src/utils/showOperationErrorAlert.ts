import useAlert from '@app/hooks/useAlert'
import { captureRepoError } from './sentry/captureRepoError'

/**
 * Shows an error AppAlert for a failed operation. `title` is the caller's user-facing message; the
 * raw error goes to the console and Sentry, never into the dialog (it leaks internals such as
 * Postgres constraint names).
 */
export function showOperationErrorAlert(title: string, err: unknown) {
	if (err !== undefined) {
		console.warn('[operation error]', title, err)
		captureRepoError(err)
	}
	useAlert.getState().showAlert({ title, variant: 'error' })
}
