import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'
import AppButton from '../AppButton'

const LABEL = 'Save'

describe('AppButton', () => {
	it('runs onPress normally', async () => {
		const onPress = jest.fn()
		await render(<AppButton onPress={onPress}>{LABEL}</AppButton>)
		await fireEvent.press(screen.getByRole('button', { name: LABEL }))
		expect(onPress).toHaveBeenCalledTimes(1)
	})

	it('shows a spinner, reports busy and ignores presses while loading', async () => {
		const onPress = jest.fn()
		await render(
			<AppButton loading onPress={onPress}>
				{LABEL}
			</AppButton>,
		)
		const button = screen.getByRole('button', { name: LABEL })
		expect(screen.getByTestId('app-button-spinner')).toBeOnTheScreen()
		expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true })
		await fireEvent.press(button)
		expect(onPress).not.toHaveBeenCalled()
	})

	it('ignores presses when disabled, without a spinner', async () => {
		const onPress = jest.fn()
		await render(
			<AppButton disabled onPress={onPress}>
				{LABEL}
			</AppButton>,
		)
		expect(screen.queryByTestId('app-button-spinner')).toBeNull()
		await fireEvent.press(screen.getByRole('button', { name: LABEL }))
		expect(onPress).not.toHaveBeenCalled()
	})
})
