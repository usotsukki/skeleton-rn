import { render } from '@testing-library/react-native'
import { ButtonDriver } from 'react-native-ui-lib/src/testkit'
import SignInButton from '../Buttons/SignInButton'

const mockedSignIn = jest.fn()
const mockedTranslate = jest.fn().mockReturnValue('Sign In')

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockedTranslate,
	}),
}))

describe('SignInButton', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should render SignIn button without provider', () => {
		const renderTree = render(<SignInButton onPress={mockedSignIn} />)
		const ButtonNode = ButtonDriver({ renderTree, testID: 'sign-in-button' })

		expect(mockedTranslate).toHaveBeenCalledWith('signInButton')
		expect(ButtonNode.exists()).toBe(true)
	})

	it('should render SignIn button with with provider', async () => {
		const renderTree = render(<SignInButton authProvider={'apple'} onPress={mockedSignIn} />)
		const ButtonNode = ButtonDriver({ renderTree, testID: 'sign-in-button' })

		expect(ButtonNode.exists()).toBe(true)
		expect(mockedTranslate).toHaveBeenCalledWith('signInWith', { provider: 'Apple' })
	})

	it('should call onPress when pressed', () => {
		const renderTree = render(<SignInButton onPress={mockedSignIn} />)
		const ButtonNode = ButtonDriver({ renderTree, testID: 'sign-in-button' })

		ButtonNode.press()

		expect(mockedSignIn).toHaveBeenCalled()
	})
})
