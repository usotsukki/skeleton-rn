import * as Haptics from 'expo-haptics'
import i18next from 'i18next'
import useAlert from '@app/shared/hooks/useAlert'
import { captureRepoError } from './captureRepoError'
import { requestErrorMessage } from './requestErrorMessage'

interface ShowDeleteConfirmationOptions {
	/** Pre-translated title, e.g. t('items.deleteTitle'). */
	title: string
	/** Entity name interpolated into the default message. */
	name: string
	/** Overrides the default "Are you sure…" message. */
	body?: string
	confirmText?: string
	cancelText?: string
	/** Runs on confirm; throw to take the error branch. */
	onConfirm: () => Promise<unknown>
	onSuccess?: () => void
	/** Replaces the default error handling (Sentry capture + error alert with a mapped message). */
	onError?: (err: unknown) => void
}

/** Destructive confirm, then `onConfirm`; failures are reported and shown without raw error text. */
export function showDeleteConfirmation({
	title,
	name,
	body,
	confirmText,
	cancelText,
	onConfirm,
	onSuccess,
	onError,
}: ShowDeleteConfirmationOptions) {
	const t = i18next.t.bind(i18next)
	useAlert.getState().showAlert({
		title,
		description: body ?? t('modules.common.deleteConfirmMessage', { name }),
		variant: 'destructive-confirm',
		continueVariant: 'destructive',
		continueButtonText: confirmText ?? t('modules.common.delete'),
		cancelButtonText: cancelText ?? t('modules.common.cancel'),
		onContinue: async () => {
			try {
				await onConfirm()
				onSuccess?.()
			} catch (err) {
				if (onError) {
					onError(err)
					return
				}
				captureRepoError(err)
				useAlert.getState().showAlert({
					title: t('modules.common.error'),
					description: requestErrorMessage(err, t),
					variant: 'error',
				})
			}
		},
	})
}

/** "Discard changes?" confirm; `onDiscard` runs only when the user chooses to discard. */
export function showUnsavedChangesAlert({ onDiscard }: { onDiscard: () => void }) {
	const t = i18next.t.bind(i18next)
	useAlert.getState().showAlert({
		title: t('modules.common.unsavedChanges.title'),
		description: t('modules.common.unsavedChanges.message'),
		variant: 'destructive-confirm',
		continueVariant: 'destructive',
		continueButtonText: t('modules.common.unsavedChanges.discard'),
		cancelButtonText: t('modules.common.unsavedChanges.keepEditing'),
		onContinue: () => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
			onDiscard()
		},
	})
}
