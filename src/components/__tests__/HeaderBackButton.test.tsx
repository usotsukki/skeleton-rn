import { render } from '@testing-library/react-native'
import React from 'react'
import { ButtonDriver } from 'react-native-ui-lib/testkit'
import BackButton from '../HeaderBackButton'

const mockedNavigation = jest.fn()
const mockedGetState = jest.fn().mockReturnValue({ index: 0 })

jest.mock('expo-router', () => {
	return {
		useNavigation: () => ({
			goBack: mockedNavigation,
			getState: mockedGetState,
		}),
	}
})

describe('BackButton', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it(`doesn't render for first screen in stack`, () => {
		const renderTree = render(<BackButton />)
		const buttonNode = ButtonDriver({ renderTree, testID: 'nav-back-button' })

		expect(buttonNode.exists()).toBe(false)

		expect(renderTree.toJSON()).toBeNull()
	})

	it(`renders correctly for second screen in stack`, () => {
		mockedGetState.mockReturnValueOnce({ index: 1 })
		const renderTree = render(<BackButton />)
		const buttonNode = ButtonDriver({ renderTree, testID: 'nav-back-button' })

		expect(buttonNode.exists()).toBe(true)
		buttonNode.press()
		expect(mockedNavigation).toHaveBeenCalled()

		expect(renderTree.toJSON()).toMatchSnapshot()
	})
})
