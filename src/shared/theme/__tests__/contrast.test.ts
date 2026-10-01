import { contrast } from '@app/test/contrast'
import { darkColors, lightColors } from '../colors'

// The pairs `.claude/rules/react-components.md` promises at WCAG AA (4.5:1). Danger pairs live in
// dangerColor.test.ts.
const SURFACES = ['bg', 'bg-elevated', 'bg-grouped'] as const
const TEXT_TOKENS = ['text', 'text-secondary', 'text-muted', 'accent'] as const
const FILLS = [
	['text-on-accent', 'accent'],
	['text-on-success', 'success'],
] as const

describe.each([
	['light', lightColors],
	['dark', darkColors],
])('%s palette contrast', (_name, palette) => {
	describe.each(TEXT_TOKENS)('%s as text', token => {
		it.each(SURFACES)('passes AA on %s', surface => {
			expect(contrast(palette[token], palette[surface])).toBeGreaterThanOrEqual(4.5)
		})
	})

	it.each(FILLS)('%s passes AA on %s', (text, fill) => {
		expect(contrast(palette[text], palette[fill])).toBeGreaterThanOrEqual(4.5)
	})
})
