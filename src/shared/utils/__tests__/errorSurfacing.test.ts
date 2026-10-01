import * as Sentry from '@sentry/react-native'
import { RepoError } from '@app/shared/api/db/errors'
import useAlert from '@app/shared/hooks/useAlert'
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
		jest.spyOn(console, 'warn').mockImplementation(() => undefined)
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('shows an error alert with the caller title only, never err.message, and reports the error', () => {
		const leaky = new Error('duplicate key value violates unique constraint "items_name_key"')
		showOperationErrorAlert('Could not save', leaky)

		expect(useAlert.getState()).toMatchObject({ visible: true, title: 'Could not save', variant: 'error' })
		expect(useAlert.getState().description).toBeUndefined()
		expect(Sentry.captureException).toHaveBeenCalledWith(leaky)
	})
})
