import { renderHook } from '@testing-library/react-native'
import useAlert from '../useAlert'
import { useUnsavedChangesGuard } from '../useUnsavedChangesGuard'

const mockDispatch = jest.fn()
const mockUsePreventRemove = jest.fn()

jest.mock('expo-router/react-navigation', () => ({
	useNavigation: () => ({ dispatch: mockDispatch }),
	usePreventRemove: (prevent: boolean, cb: unknown) => mockUsePreventRemove(prevent, cb),
}))

describe('useUnsavedChangesGuard', () => {
	it('blocks leaving only while dirty and not submitting', async () => {
		const { rerender } = await renderHook(
			(p: { isDirty: boolean; isSubmitting: boolean }) => useUnsavedChangesGuard(p),
			{
				initialProps: { isDirty: false, isSubmitting: false },
			},
		)
		expect(mockUsePreventRemove).toHaveBeenLastCalledWith(false, expect.any(Function))

		await rerender({ isDirty: true, isSubmitting: false })
		expect(mockUsePreventRemove).toHaveBeenLastCalledWith(true, expect.any(Function))

		await rerender({ isDirty: true, isSubmitting: true })
		expect(mockUsePreventRemove).toHaveBeenLastCalledWith(false, expect.any(Function))
	})

	it('asks before leaving and replays the navigation action on discard', async () => {
		await renderHook(() => useUnsavedChangesGuard({ isDirty: true, isSubmitting: false }))
		const onPrevented = mockUsePreventRemove.mock.lastCall?.[1] as (e: { data: { action: object } }) => void
		const action = { type: 'GO_BACK' }

		onPrevented({ data: { action } })
		expect(useAlert.getState().visible).toBe(true)
		expect(mockDispatch).not.toHaveBeenCalled()

		useAlert.getState().onContinue?.()
		expect(mockDispatch).toHaveBeenCalledWith(action)
	})
})
