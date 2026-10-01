import { useCallback, useRef, useState } from 'react'

/**
 * Spinner state for user-initiated refreshes only, so background refetches (focus, reconnect,
 * invalidation) don't show it. A second pull while one is running is ignored.
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
	const [refreshing, setRefreshing] = useState(false)
	const inFlight = useRef(false)

	const onRefresh = useCallback((): Promise<void> => {
		if (inFlight.current) return Promise.resolve()
		inFlight.current = true
		setRefreshing(true)
		return refetch()
			.then(() => undefined)
			.finally(() => {
				inFlight.current = false
				setRefreshing(false)
			})
	}, [refetch])

	return { refreshing, onRefresh }
}
