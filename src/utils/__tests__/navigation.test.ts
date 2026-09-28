import { isPushedTabScreen } from '../navigation'

describe('isPushedTabScreen', () => {
	it('is false on a tab root and outside the tabs', () => {
		expect(isPushedTabScreen(['(app)', '(drawer)', '(tabs)', 'Home'])).toBe(false)
		expect(isPushedTabScreen(['(app)', '(drawer)', '(tabs)', 'Map'])).toBe(false)
		expect(isPushedTabScreen(['(app)', '(drawer)', 'Settings'])).toBe(false)
		expect(isPushedTabScreen([])).toBe(false)
	})

	it('is true on a screen pushed onto a tab stack', () => {
		expect(isPushedTabScreen(['(app)', '(drawer)', '(tabs)', 'Home', 'ListDemo'])).toBe(true)
	})
})
