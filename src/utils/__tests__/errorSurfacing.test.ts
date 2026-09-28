import * as Sentry from '@sentry/react-native'
import { Alert } from 'react-native'
import { RepoError } from '@app/api/db/errors'
import { repoErrorMessage } from '../repoErrorMessage'
import { showOperationErrorAlert } from '../showOperationErrorAlert'

const t = ((key: string) => key) as never

describe('repoErrorMessage', () => {
	it('maps repo errors, including timeouts, to their i18n key', () => {
		expect(repoErrorMessage(RepoError.Timeout('items.list'), t, 'fallback')).toBe('error.repo.timeout')
		expect(repoErrorMessage(RepoError.Forbidden('items.delete'), t, 'fallback')).toBe('error.repo.forbidden')
	})

	it('never returns the raw message of other errors', () => {
		const leaky = new Error('duplicate key value violates unique constraint "items_name_key"')
		expect(repoErrorMessage(leaky, t, 'fallback')).toBe('fallback')
	})
})

describe('showOperationErrorAlert', () => {
	beforeEach(() => {
		jest.spyOn(Alert, 'alert').mockImplementation(() => undefined)
		jest.spyOn(console, 'warn').mockImplementation(() => undefined)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('shows a generic body, never err.message, and reports the error', () => {
		const leaky = new Error('duplicate key value violates unique constraint "items_name_key"')
		showOperationErrorAlert('Could not save', leaky)

		expect(Alert.alert).toHaveBeenCalledWith('Could not save', 'modules.common.somethingWentWrong')
		expect(Sentry.captureException).toHaveBeenCalledWith(leaky)
	})
})
