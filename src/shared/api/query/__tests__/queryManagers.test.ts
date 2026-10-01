import NetInfo from '@react-native-community/netinfo'
import { focusManager, onlineManager } from '@tanstack/react-query'
import { AppState, type AppStateStatus } from 'react-native'
import { bindQueryManagers } from '../queryManagers'

type NetInfoHandler = (state: { isConnected: boolean | null }) => void

const mockNetInfoHandlers: NetInfoHandler[] = []
const mockNetInfoUnsubscribe = jest.fn()

jest.mock('@react-native-community/netinfo', () => ({
	__esModule: true,
	default: {
		addEventListener: jest.fn((handler: NetInfoHandler) => {
			mockNetInfoHandlers.push(handler)
			return mockNetInfoUnsubscribe
		}),
	},
}))

describe('bindQueryManagers', () => {
	let appStateHandlers: Array<(state: AppStateStatus) => void>
	const removeAppStateListener = jest.fn()

	beforeEach(() => {
		appStateHandlers = []
		jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
			appStateHandlers.push(handler as (state: AppStateStatus) => void)
			return { remove: removeAppStateListener } as ReturnType<typeof AppState.addEventListener>
		})
	})

	afterEach(() => {
		mockNetInfoHandlers.length = 0
		onlineManager.setEventListener(() => undefined)
		onlineManager.setOnline(true)
		focusManager.setEventListener(() => undefined)
		focusManager.setFocused(undefined)
		jest.restoreAllMocks()
	})

	it('drives the online state from NetInfo and treats an unknown state as online', () => {
		bindQueryManagers()
		expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1)

		mockNetInfoHandlers[0]({ isConnected: false })
		expect(onlineManager.isOnline()).toBe(false)

		mockNetInfoHandlers[0]({ isConnected: null })
		expect(onlineManager.isOnline()).toBe(true)
	})

	it('drives the focus state from AppState', () => {
		bindQueryManagers()

		appStateHandlers[0]('background')
		expect(focusManager.isFocused()).toBe(false)

		appStateHandlers[0]('active')
		expect(focusManager.isFocused()).toBe(true)
	})

	it('releases both subscriptions when rebound', () => {
		bindQueryManagers()
		bindQueryManagers()
		expect(mockNetInfoUnsubscribe).toHaveBeenCalledTimes(1)
		expect(removeAppStateListener).toHaveBeenCalledTimes(1)
	})
})
