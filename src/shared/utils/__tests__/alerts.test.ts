import * as Sentry from '@sentry/react-native'
import useAlert from '@app/shared/hooks/useAlert'
import { showDeleteConfirmation, showUnsavedChangesAlert } from '../alerts'

describe('showDeleteConfirmation', () => {
	it('asks with a destructive confirm, then runs onConfirm and onSuccess', async () => {
		const onConfirm = jest.fn(() => Promise.resolve())
		const onSuccess = jest.fn()
		showDeleteConfirmation({ title: 'Delete item', name: 'Roma', onConfirm, onSuccess })

		const alert = useAlert.getState()
		expect(alert.visible).toBe(true)
		expect(alert.variant).toBe('destructive-confirm')
		expect(alert.continueVariant).toBe('destructive')
		expect(alert.continueButtonText).toBe('modules.common.delete')
		expect(onConfirm).not.toHaveBeenCalled()

		await alert.onContinue?.()
		expect(onConfirm).toHaveBeenCalledTimes(1)
		expect(onSuccess).toHaveBeenCalledTimes(1)
	})

	it('reports a failure and shows a mapped error, never the raw message', async () => {
		const failure = new Error('fetch failed: offline')
		showDeleteConfirmation({ title: 'Delete item', name: 'Roma', onConfirm: () => Promise.reject(failure) })

		await useAlert.getState().onContinue?.()

		const alert = useAlert.getState()
		expect(alert.variant).toBe('error')
		expect(alert.description).toBe('error.networkError')
		expect(Sentry.captureException).toHaveBeenCalledWith(failure)
	})

	it('hands the error to onError when given', async () => {
		const onError = jest.fn()
		showDeleteConfirmation({ title: 't', name: 'n', onConfirm: () => Promise.reject(new Error('x')), onError })
		await useAlert.getState().onContinue?.()
		expect(onError).toHaveBeenCalledTimes(1)
		expect(useAlert.getState().variant).toBe('destructive-confirm')
	})
})

describe('showUnsavedChangesAlert', () => {
	it('discards only when the user confirms', () => {
		const onDiscard = jest.fn()
		showUnsavedChangesAlert({ onDiscard })
		const alert = useAlert.getState()
		expect(alert.continueButtonText).toBe('modules.common.unsavedChanges.discard')
		expect(alert.cancelButtonText).toBe('modules.common.unsavedChanges.keepEditing')

		alert.onCancel?.()
		expect(onDiscard).not.toHaveBeenCalled()
		alert.onContinue?.()
		expect(onDiscard).toHaveBeenCalledTimes(1)
	})
})
