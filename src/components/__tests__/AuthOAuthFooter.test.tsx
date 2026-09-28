import { render, screen } from '@testing-library/react-native'
import { AuthOAuthFooter } from '@app/components/shared'

const props = { onApple: jest.fn(), promptText: 'No account?', actionLabel: 'Sign Up', onAction: jest.fn() }

describe('AuthOAuthFooter', () => {
	it('shows the Google button when a handler is given', async () => {
		await render(<AuthOAuthFooter {...props} onGoogle={jest.fn()} />)
		expect(screen.getByLabelText('a11y.signInWithGoogle')).toBeTruthy()
	})

	it('hides the Google button without a handler (no Google client id in this build)', async () => {
		await render(<AuthOAuthFooter {...props} />)
		expect(screen.queryByLabelText('a11y.signInWithGoogle')).toBeNull()
		expect(screen.getByLabelText('a11y.signInWithApple')).toBeTruthy()
	})
})
