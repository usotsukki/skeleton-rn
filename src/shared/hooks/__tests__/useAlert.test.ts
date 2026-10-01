import { Keyboard } from 'react-native'
import useAlert from '../useAlert'

describe('useAlert', () => {
	it('opens immediately without a keyboard and clears everything on hide', () => {
		jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false)
		useAlert.getState().showAlert({ title: 'Saved', description: 'Done', variant: 'success' })
		expect(useAlert.getState()).toMatchObject({ visible: true, title: 'Saved', variant: 'success' })

		useAlert.getState().hideAlert()
		expect(useAlert.getState()).toMatchObject({ visible: false, title: '', description: undefined, variant: undefined })
	})

	it('dismisses a visible keyboard first and opens when it has hidden', () => {
		jest.useFakeTimers()
		let onHide: () => void = () => undefined
		jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true)
		const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined)
		jest.spyOn(Keyboard, 'addListener').mockImplementation((_event, handler) => {
			onHide = handler as () => void
			return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>
		})

		useAlert.getState().showAlert({ title: 'Delete?' })
		expect(dismiss).toHaveBeenCalled()
		expect(useAlert.getState().visible).toBe(false)

		onHide()
		expect(useAlert.getState().visible).toBe(true)
	})

	it('falls back when keyboardDidHide never fires, but not while the keyboard is still up', () => {
		jest.useFakeTimers()
		const isVisible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true)
		jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined)
		jest
			.spyOn(Keyboard, 'addListener')
			.mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>)

		useAlert.getState().showAlert({ title: 'Delete?' })
		jest.advanceTimersByTime(300)
		expect(useAlert.getState().visible).toBe(false)

		isVisible.mockReturnValue(false)
		jest.advanceTimersByTime(700)
		expect(useAlert.getState().visible).toBe(true)
	})

	it('opens at the fallback check once the keyboard has hidden', () => {
		jest.useFakeTimers()
		const isVisible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true)
		jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => isVisible.mockReturnValue(false))
		jest
			.spyOn(Keyboard, 'addListener')
			.mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>)

		useAlert.getState().showAlert({ title: 'Delete?' })
		jest.advanceTimersByTime(300)
		expect(useAlert.getState().visible).toBe(true)
	})

	it('replaces the previous alert entirely instead of merging into it', () => {
		jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false)
		const onContinue = jest.fn()
		useAlert.getState().showAlert({
			title: 'Delete?',
			cancelButtonText: 'Cancel',
			continueVariant: 'destructive',
			onContinue,
		})
		useAlert.getState().showAlert({ title: 'Failed', variant: 'error' })

		const state = useAlert.getState()
		expect(state).toMatchObject({ visible: true, title: 'Failed', variant: 'error' })
		expect(state.cancelButtonText).toBeUndefined()
		expect(state.continueVariant).toBeUndefined()
		expect(state.onContinue).toBeUndefined()
	})
})
