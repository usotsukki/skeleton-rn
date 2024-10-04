import { render } from '@testing-library/react-native'
import React from 'react'
import { TextDriver } from 'react-native-ui-lib/testkit'
import Text from '../Text'

it(`renders correctly`, () => {
	const renderTree = render(<Text testID="text">Snapshot test?</Text>)
	const textNode = TextDriver({ renderTree, testID: 'text' })
	expect(textNode).toMatchSnapshot()
})
