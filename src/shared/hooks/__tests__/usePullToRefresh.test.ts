import { act, renderHook } from '@testing-library/react-native'
import { usePullToRefresh } from '../usePullToRefresh'

function heldRefetch() {
	let finish: () => void = () => undefined
	const refetch = jest.fn(
		() =>
			new Promise<void>(resolve => {
				finish = resolve
			}),
	)
	return { refetch, finish: () => finish() }
}

describe('usePullToRefresh', () => {
	it('shows the spinner only while its own refresh runs', async () => {
		const { refetch, finish } = heldRefetch()
		const { result } = await renderHook(() => usePullToRefresh(refetch))
		expect(result.current.refreshing).toBe(false)

		let pending: Promise<void> = Promise.resolve()
		await act(() => {
			pending = result.current.onRefresh()
		})
		expect(result.current.refreshing).toBe(true)

		await act(async () => {
			finish()
			await pending
		})
		expect(result.current.refreshing).toBe(false)
	})

	it('ignores a second pull while one is running', async () => {
		const { refetch, finish } = heldRefetch()
		const { result } = await renderHook(() => usePullToRefresh(refetch))

		let first: Promise<void> = Promise.resolve()
		await act(() => {
			first = result.current.onRefresh()
		})
		await act(() => result.current.onRefresh())
		await act(async () => {
			finish()
			await first
		})

		expect(refetch).toHaveBeenCalledTimes(1)
	})

	it('clears the spinner when the refresh fails', async () => {
		const refetch = jest.fn(() => Promise.reject(new Error('boom')))
		const { result } = await renderHook(() => usePullToRefresh(refetch))

		await act(async () => {
			await result.current.onRefresh().catch(() => undefined)
		})
		expect(result.current.refreshing).toBe(false)
	})
})
