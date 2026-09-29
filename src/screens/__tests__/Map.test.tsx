import { render, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'
import Map from '../Map'

jest.mock('react-native-maps', () => {
	const { View } = jest.requireActual('react-native')
	const MapView = (props: object) => <View testID="map-view" {...props} />
	return { __esModule: true, default: MapView, Marker: () => null }
})

const mockEmbedded: { manifest?: unknown } = {}
jest.mock('expo', () => ({
	...jest.requireActual('expo'),
	requireOptionalNativeModule: (name: string) => (name === 'ExponentConstants' ? mockEmbedded : null),
}))

// Android passes the embedded config as a JSON string.
async function renderMap(os: 'ios' | 'android', androidMapsConfigured: boolean) {
	Platform.OS = os
	mockEmbedded.manifest = JSON.stringify({ extra: { androidMapsConfigured } })
	await render(<Map />)
}

describe('Map', () => {
	const os = Platform.OS
	afterEach(() => {
		Platform.OS = os
	})

	it('shows a message instead of the map on Android without an API key (the map view would crash)', async () => {
		await renderMap('android', false)
		expect(screen.getByTestId('map-unavailable')).toBeTruthy()
		expect(screen.queryByTestId('map-view')).toBeNull()
	})

	it('renders the map on Android with an API key', async () => {
		await renderMap('android', true)
		expect(screen.getByTestId('map-view')).toBeTruthy()
	})

	it('renders the map on iOS without a key', async () => {
		await renderMap('ios', false)
		expect(screen.getByTestId('map-view')).toBeTruthy()
	})

	it('shows the message when the embedded config cannot be read', async () => {
		Platform.OS = 'android'
		mockEmbedded.manifest = '{not json'
		await render(<Map />)
		expect(screen.getByTestId('map-unavailable')).toBeTruthy()
	})
})
