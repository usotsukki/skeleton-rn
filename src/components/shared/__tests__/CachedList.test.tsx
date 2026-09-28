import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'
import { RepoError } from '@app/api/db/errors'
import { renderWithAppProviders } from '@app/utils/test-utils/render'
import { CachedList, type CachedListQuery } from '../CachedList'

type Query = CachedListQuery<string>

const PLACEHOLDER = 'Placeholder'

const loaded: Query = {
	data: ['Roma', 'Milano'],
	error: null,
	isError: false,
	fetchStatus: 'idle',
	refetch: jest.fn(() => Promise.resolve()) as unknown as Query['refetch'],
}

const renderList = (query: Partial<Query>) =>
	renderWithAppProviders(
		<CachedList
			emptyTitle="No places yet"
			errorTitle="Couldn't load places"
			keyExtractor={item => item}
			query={{ ...loaded, ...query }}
			renderItem={({ item }) => <Text>{item}</Text>}
			skeleton={<Text>{PLACEHOLDER}</Text>}
			testID="places"
		/>,
	)

// FlashList hands `refreshing` to its ScrollView's refreshControl.
const isRefreshing = () =>
	(screen.getByTestId('places').props.refreshControl as { props: { refreshing: boolean } }).props.refreshing

function heldRefetch() {
	let finish: () => void = () => undefined
	const refetch = jest.fn(
		() =>
			new Promise<void>(resolve => {
				finish = resolve
			}),
	)
	return { refetch: refetch as unknown as Query['refetch'], calls: refetch, finish: () => act(async () => finish()) }
}

describe('CachedList', () => {
	it('shows the skeleton before any data', async () => {
		await renderList({ data: undefined, fetchStatus: 'fetching' })
		expect(screen.getByText(PLACEHOLDER)).toBeOnTheScreen()
		expect(screen.queryByText('Roma')).toBeNull()
	})

	it('shows the offline state when the first load is paused', async () => {
		await renderList({ data: undefined, fetchStatus: 'paused' })
		expect(screen.getByText('cachedList.offlineTitle')).toBeOnTheScreen()
		expect(screen.queryByRole('button', { name: 'cachedList.retry' })).toBeNull()
	})

	it('blocks with a mapped message and Retry when the first load fails', async () => {
		const refetch = jest.fn(() => Promise.resolve()) as unknown as Query['refetch']
		await renderList({ data: undefined, isError: true, error: new Error('fetch failed: offline'), refetch })

		expect(screen.getByText("Couldn't load places")).toBeOnTheScreen()
		expect(screen.getByText('error.networkError')).toBeOnTheScreen()
		await fireEvent.press(screen.getByRole('button', { name: 'cachedList.retry' }))
		expect(refetch).toHaveBeenCalledTimes(1)
	})

	it('shows progress, not the error, while a failed first load is retried', async () => {
		await renderList({ data: undefined, isError: true, error: new Error('boom'), fetchStatus: 'fetching' })
		expect(screen.getByText(PLACEHOLDER)).toBeOnTheScreen()
		expect(screen.queryByText("Couldn't load places")).toBeNull()
	})

	it('shows the rows once data has loaded', async () => {
		await renderList({})
		expect(screen.getByText('Roma')).toBeOnTheScreen()
		expect(screen.queryByText(/cachedList.refreshFailed/)).toBeNull()
	})

	it('shows the empty state for an empty result', async () => {
		await renderList({ data: [] })
		expect(screen.getByText('No places yet')).toBeOnTheScreen()
	})

	it('stops the pull spinner when the refetch is paused offline', async () => {
		const { refetch, finish } = heldRefetch()
		const view = await renderList({ refetch })
		const press = fireEvent(screen.getByTestId('places'), 'refresh')
		await waitFor(() => expect(isRefreshing()).toBe(true))

		await view.rerender(
			<CachedList
				emptyTitle="No places yet"
				errorTitle="Couldn't load places"
				keyExtractor={item => item}
				query={{ ...loaded, refetch, fetchStatus: 'paused' }}
				renderItem={({ item }) => <Text>{item}</Text>}
				testID="places"
			/>,
		)
		expect(isRefreshing()).toBe(false)
		await finish()
		await press
	})

	it('shows the refresh notice on an empty list too', async () => {
		await renderList({ data: [], isError: true, error: RepoError.Timeout('places.list') })
		expect(screen.getByText('No places yet')).toBeOnTheScreen()
		expect(screen.getByText('cachedList.refreshFailed')).toBeOnTheScreen()
	})

	it('says "network", not "server error", for a transport failure a repository wrapped', async () => {
		const flattened = { message: 'TypeError: Network request failed', code: '' }
		await renderList({ data: undefined, isError: true, error: RepoError.Upstream('places.list', flattened) })
		expect(screen.getByText('error.networkError')).toBeOnTheScreen()
	})

	it('keeps the rows when a refresh fails and retries like a pull', async () => {
		const { refetch, calls, finish } = heldRefetch()
		await renderList({ isError: true, error: RepoError.Timeout('places.list'), refetch })

		expect(screen.getByText('Roma')).toBeOnTheScreen()
		expect(screen.getByText('cachedList.refreshFailed')).toBeOnTheScreen()

		const press = fireEvent.press(screen.getByRole('button', { name: 'cachedList.retry' }))
		await waitFor(() => expect(isRefreshing()).toBe(true))
		expect(calls).toHaveBeenCalledTimes(1)

		await finish()
		await press
		expect(isRefreshing()).toBe(false)
		expect(screen.getByText('Roma')).toBeOnTheScreen()
	})
})
