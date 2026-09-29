import { darkColors, lightColors } from '../colors'

const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)

function luminance(hex: string) {
	const [r, g, b] = channels(hex).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

function hue(hex: string) {
	const [r, g, b] = channels(hex)
	const max = Math.max(r, g, b)
	const delta = max - Math.min(r, g, b)
	let h = (r - g) / delta + 4
	if (max === r) h = ((g - b) / delta) % 6
	else if (max === g) h = (b - r) / delta + 2
	return (h * 60 + 360) % 360
}

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
