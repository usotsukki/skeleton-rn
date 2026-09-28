import { renderHook } from '@testing-library/react-native'
import { AppState, type AppStateStatus } from 'react-native'
import { setAuthAutoRefresh } from '@app/api/auth'
import { useAuthAutoRefresh } from '../useAuthAutoRefresh'

jest.mock('@app/api/auth', () => ({ setAuthAutoRefresh: jest.fn() }))

describe('useAuthAutoRefresh', () => {
	it('runs token refresh only while the app is active', async () => {
		let onChange: (state: AppStateStatus) => void = () => undefined
		const remove = jest.fn()
		jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
			onChange = handler as (state: AppStateStatus) => void
			return { remove } as ReturnType<typeof AppState.addEventListener>
		})

		const { unmount } = await renderHook(() => useAuthAutoRefresh())

		onChange('background')
		expect(setAuthAutoRefresh).toHaveBeenLastCalledWith(false)
		onChange('active')
		expect(setAuthAutoRefresh).toHaveBeenLastCalledWith(true)

		await unmount()
		expect(remove).toHaveBeenCalled()
	})
})
