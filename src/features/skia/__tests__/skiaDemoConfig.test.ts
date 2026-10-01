import { buildStarLayers, MAX_PLANETS, MIN_PLANETS, PLANETS } from '../skiaDemoConfig'

describe('Skia demo config', () => {
	it('keeps planet controls aligned with the configured planets', () => {
		expect(MIN_PLANETS).toBe(1)
		expect(MAX_PLANETS).toBe(PLANETS.length)
		expect(PLANETS).toHaveLength(6)
	})

	it('builds deterministic star layers', () => {
		expect(buildStarLayers(3)).toEqual([
			{
				x: 0.21132115912208504,
				y: 0.7094221536351166,
				r: 1.374835390946502,
				opacity: 0.7552941176470588,
				twinkle: 1.2166666666666668,
			},
			{
				x: 0.2511917009602195,
				y: 0.5453317901234568,
				r: 1.0476817558299039,
				opacity: 0.29647058823529415,
				twinkle: 1.2277777777777779,
			},
			{
				x: 0.2910622427983539,
				y: 0.381241426611797,
				r: 0.7205281207133059,
				opacity: 0.4258823529411765,
				twinkle: 1.238888888888889,
			},
		])
	})
})
