import { contrast, hue } from '@app/test/contrast'
import { darkColors, lightColors } from '../colors'

const hueDistance = (a: string, b: string) => {
	const d = Math.abs(hue(a) - hue(b))
	return Math.min(d, 360 - d)
}

describe.each([
	['light', lightColors],
	['dark', darkColors],
])('%s danger color', (_name, palette) => {
	it('is a different hue from the accent, so an error does not read as brand color', () => {
		expect(hueDistance(palette.danger, palette.accent)).toBeGreaterThanOrEqual(10)
	})

	it.each(['bg', 'bg-elevated', 'bg-grouped'] as const)('passes AA as text on %s', surface => {
		expect(contrast(palette.danger, palette[surface])).toBeGreaterThanOrEqual(4.5)
	})

	it('carries its on-danger text at AA (error toast)', () => {
		expect(contrast(palette['text-on-danger'], palette.danger)).toBeGreaterThanOrEqual(4.5)
	})
})
