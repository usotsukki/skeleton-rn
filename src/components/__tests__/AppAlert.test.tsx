import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import * as Haptics from 'expo-haptics'
import React from 'react'
import useAlert from '@app/hooks/useAlert'
import AppAlert from '../AppAlert'

jest.mock('@rn-primitives/portal', () => ({
	Portal: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('react-native-screens', () => ({
	FullWindowOverlay: ({ children }: { children: React.ReactNode }) => children,
}))

describe('AppAlert Component', () => {
	async function renderAlert() {
		return render(<AppAlert />)
	}

	beforeEach(async () => {
		jest.clearAllMocks()
		await act(() => {
			useAlert.getState().hideAlert()
		})
	})

	it('should not render when not visible', async () => {
		await renderAlert()
		expect(screen.queryByText('Test Title')).toBeNull()
	})

	it('should render title and description when visible', async () => {
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Test Title',
				description: 'Test Description',
			})
		})

		await renderAlert()

		expect(screen.getByText('Test Title')).toBeTruthy()
		expect(screen.getByText('Test Description')).toBeTruthy()
		expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success)
	})

	it('should call onContinue and hideAlert when continue button is pressed', async () => {
		const onContinue = jest.fn()
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Test Title',
				description: 'Test Description',
				onContinue,
			})
		})

		await renderAlert()

		const continueButton = screen.getByText('modules.common.great')
		await fireEvent.press(continueButton)

		expect(onContinue).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(useAlert.getState().visible).toBe(false))
		expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1)
	})

	it('should call onCancel and hideAlert when cancel button is pressed', async () => {
		const onCancel = jest.fn()
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Test Title',
				description: 'Test Description',
				cancelButtonText: 'Cancel',
				onCancel,
			})
		})

		await renderAlert()

		const cancelButton = screen.getByText('Cancel')
		await fireEvent.press(cancelButton)

		expect(onCancel).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(useAlert.getState().visible).toBe(false))
		expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1)
	})

	it('should use custom continue button text', async () => {
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Test Title',
				description: 'Test Description',
				continueButtonText: 'Confirm',
			})
		})

		await renderAlert()

		expect(screen.getByText('Confirm')).toBeTruthy()
	})

	it('fires Warning haptic for destructive-confirm variant', async () => {
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Delete pet?',
				variant: 'destructive-confirm',
				cancelButtonText: 'Cancel',
				continueButtonText: 'Delete',
			})
		})

		await renderAlert()

		expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning)
	})

	it('fires Warning haptic for error variant', async () => {
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Could not save',
				variant: 'error',
			})
		})

		await renderAlert()

		expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning)
	})

	it('does not fire haptic for plain variant', async () => {
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Plain',
				variant: 'plain',
			})
		})

		await renderAlert()

		expect(Haptics.notificationAsync).not.toHaveBeenCalled()
	})

	it('cancelable: backdrop press fires onDismiss', async () => {
		const onDismiss = jest.fn()
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Cancelable',
				cancelable: true,
				onDismiss,
			})
		})

		await renderAlert()

		await fireEvent.press(screen.getByTestId('AppAlertOverlay'))

		expect(onDismiss).toHaveBeenCalledTimes(1)
		await waitFor(() => expect(useAlert.getState().visible).toBe(false))
	})

	it('non-cancelable: backdrop press does nothing', async () => {
		const onDismiss = jest.fn()
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Sticky',
				onDismiss,
			})
		})

		await renderAlert()

		await fireEvent.press(screen.getByTestId('AppAlertOverlay'))

		expect(onDismiss).not.toHaveBeenCalled()
		expect(useAlert.getState().visible).toBe(true)
	})

	it('Android back dismisses the alert', async () => {
		const { BackHandler, Platform } = jest.requireActual<typeof import('react-native')>('react-native')
		const original = Platform.OS
		Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
		let onBack: () => boolean = () => false
		jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_e, handler) => {
			onBack = handler as () => boolean
			return { remove: jest.fn() }
		})
		try {
			const onDismiss = jest.fn()
			await act(() => {
				useAlert.getState().showAlert({ title: 'Back test', onDismiss })
			})
			await renderAlert()

			let handled = false
			await act(() => {
				handled = onBack()
			})
			expect(handled).toBe(true)
			expect(onDismiss).toHaveBeenCalledTimes(1)
		} finally {
			Object.defineProperty(Platform, 'OS', { value: original, configurable: true })
		}
	})

	it('exposes the actions as separate buttons and the text as one alert', async () => {
		await act(() => {
			useAlert.getState().showAlert({
				title: 'Delete item',
				description: 'Sure?',
				continueButtonText: 'Delete',
				cancelButtonText: 'Keep',
				continueVariant: 'destructive',
			})
		})
		await renderAlert()
		expect(screen.getByRole('button', { name: 'Delete' })).toBeOnTheScreen()
		expect(screen.getByRole('button', { name: 'Keep' })).toBeOnTheScreen()
		expect(screen.getByRole('alert')).toBeOnTheScreen()
		// RNTL doesn't model `accessible` grouping; the backdrop must not be an accessibility element
		// (it would swallow the buttons). The card is a Reanimated view the global mock flattens, so its
		// `accessible` is verified on device.
		expect(screen.getByTestId('AppAlertOverlay').props.accessible).toBe(false)
	})

	it('runs the action once even if tapped again during the exit fade', async () => {
		const onContinue = jest.fn()
		await act(() => {
			useAlert.getState().showAlert({ title: 'Delete item', continueButtonText: 'Delete', onContinue })
		})
		await renderAlert()
		const button = screen.getByRole('button', { name: 'Delete' })
		await fireEvent.press(button)
		await fireEvent.press(button)
		expect(onContinue).toHaveBeenCalledTimes(1)
	})
})
