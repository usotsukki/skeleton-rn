import { render } from '@testing-library/react-native'
import { ButtonDriver } from 'react-native-ui-lib/src/testkit'
import SwitchLanguageButton from '../Buttons/SwitchLanguageButton'

const mockedChangeLanguage = jest.fn()

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		i18n: { changeLanguage: mockedChangeLanguage },
	}),
}))

describe('SwitchLanguageButton', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should render the button', () => {
		const renderTree = render(<SwitchLanguageButton />)
		const ButtonNode = ButtonDriver({ renderTree, testID: 'switch-language-button' })
		expect(ButtonNode.exists()).toBe(true)
	})

	it('should change app language when pressed', () => {
		const renderTree = render(<SwitchLanguageButton />)
		const ButtonNode = ButtonDriver({ renderTree, testID: 'switch-language-button' })

		ButtonNode.press()
		ButtonNode.press()
		ButtonNode.press()

		expect(mockedChangeLanguage).toHaveBeenCalledTimes(3)
	})
})
