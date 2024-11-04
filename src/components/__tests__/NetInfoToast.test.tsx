import { act, fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'
import NetInfoToast from '@app/components/NetInfoToast'
import * as hooks from '@app/hooks'

const mockedTranslate = jest.fn().mockReturnValue("You're currently offline")

const mockConnectionStatus = (status: boolean) => {
	jest.spyOn(hooks, 'useConnectionStatus').mockImplementation(() => status)
}

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockedTranslate,
	}),
}))

jest.mock('@app/hooks', () => ({
	useConnectionStatus: jest.fn(),
}))

describe('NetInfoToast', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should display the toast if the user is offline', () => {
		jest.useFakeTimers()
		mockConnectionStatus(false)
		render(<NetInfoToast />)

		act(() => jest.runAllTimers())

		expect(screen.getByTestId('toast-netinfo')).toBeTruthy()
		expect(mockedTranslate).toHaveBeenCalledWith('offline')
		expect(screen.getByText(`You're currently offline`)).toBeTruthy()
	})

	it(`should not display the toast if the user is online`, () => {
		jest.useFakeTimers()
		mockConnectionStatus(true)
		render(<NetInfoToast />)
		act(() => jest.runAllTimers())
		expect(screen.queryByTestId('toast-netinfo')).toBeNull()
	})

	it('should toggle visibility when connection status changes', () => {
		jest.useFakeTimers()
		// user is online
		mockConnectionStatus(true)
		const { rerender } = render(<NetInfoToast />)
		expect(screen.queryByText("You're currently offline")).toBeNull()

		// offline mode start
		mockConnectionStatus(false)
		rerender(<NetInfoToast />)
		act(() => jest.runAllTimers())
		expect(screen.getByTestId('toast-netinfo')).toBeTruthy()

		// offline mode end
		mockConnectionStatus(true)
		rerender(<NetInfoToast />)
		act(() => jest.runAllTimers())
		expect(screen.queryByTestId('toast-netinfo')).toBeNull()
	})

	it('should hide the toast after dismissing"', () => {
		jest.useFakeTimers()
		mockConnectionStatus(false)
		render(<NetInfoToast />)
		act(() => jest.runAllTimers())
		const toast = screen.getByTestId('toast-netinfo')
		expect(toast).toBeTruthy()
		fireEvent(toast, 'onDismiss')
		act(() => jest.runAllTimers())
		expect(screen.queryByTestId('toast-netinfo')).toBeNull()
	})
})
