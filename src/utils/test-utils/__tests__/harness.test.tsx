import { onlineManager, useQuery } from '@tanstack/react-query'
import { screen } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'
import { zustandStorage } from '@app/storage'
import { useThemeStore } from '@app/store/themeStore'
import { renderWithAppProviders } from '../render'

function Greeting() {
	const { data } = useQuery({ queryKey: ['greeting'], queryFn: () => Promise.resolve('hello') })
	return <Text>{data ?? 'loading'}</Text>
}

// Tests in this file run in order; each second test checks what the first one left behind.
describe('test harness', () => {
	it('rejects real network requests', async () => {
		await expect(fetch('https://example.com/api')).rejects.toThrow(
			'Unexpected network request in a test: https://example.com/api',
		)
	})

	it('changes shared state (checked by the next test)', () => {
		useThemeStore.getState().setMode('light')
		zustandStorage.set('leftover', 'value')
		onlineManager.setOnline(false)
		expect(useThemeStore.getState().mode).toBe('light')
	})

	it('starts the next test from a clean slate', () => {
		expect(useThemeStore.getState().mode).toBe(useThemeStore.getInitialState().mode)
		expect(zustandStorage.getString('leftover')).toBeUndefined()
		// Persisted store key ('theme') is emptied too, not rewritten by the store reset.
		expect(zustandStorage.getString('theme')).toBeUndefined()
		expect(onlineManager.isOnline()).toBe(true)
	})

	it('renders with a query client', async () => {
		const { queryClient } = await renderWithAppProviders(<Greeting />)
		expect(await screen.findByText('hello')).toBeOnTheScreen()
		expect(queryClient.getQueryData(['greeting'])).toBe('hello')
	})
})
