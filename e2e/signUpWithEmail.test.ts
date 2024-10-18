import { expect, waitFor } from 'detox'

describe('SignUpWithEmail', () => {
	beforeAll(async () => {
		await device.launchApp()
	})
	it('should sign up with email', async () => {
		await expect(element(by.id('Welcome'))).toBeVisible()
		await element(by.id('Welcome.SignUpButton')).tap()

		await expect(element(by.id('SignUp'))).toBeVisible()
		await element(by.id('SignUp.Email')).typeText(`test${Date.now()}@test.com`)
		await element(by.id('SignUp.Password')).typeText('123456')
		await element(by.id('SignUp.ConfirmationPassword')).typeText('123456')
		await element(by.id('SignUp.SubmitButton')).tap()

		await waitFor(element(by.id('TabBar.Demo')))
			.toBeVisible()
			.withTimeout(10000)

		await element(by.id('TabBar.Demo')).tap()
		await expect(element(by.id('Demo'))).toBeVisible()
		await element(by.id('Demo.SignOutButton')).tap()

		await expect(element(by.id('Welcome'))).toBeVisible()
	})
})
