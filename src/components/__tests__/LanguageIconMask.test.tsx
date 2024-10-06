import { render, screen } from '@testing-library/react-native'
import React from 'react'
import LanguageIconMask from '../LanguageIconMask'

describe('LanguageIconMask', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('renders correctly', () => {
		const renderTree = render(<LanguageIconMask />)

		expect(renderTree).not.toBeNull()
		expect(screen.getByTestId('language-icon.container')).toBeTruthy()
		expect(screen.getByTestId('language-icon.mask')).toBeTruthy()
		expect(screen.getByTestId('language-icon.image')).toBeTruthy()
		expect(renderTree.toJSON()).toMatchSnapshot()
	})
})
