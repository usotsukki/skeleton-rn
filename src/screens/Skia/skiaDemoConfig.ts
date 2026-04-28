import type { CometDustConfig, PlanetConfig, StarLayer } from './types'

export const PLANETS: PlanetConfig[] = [
	{
		radius: 58,
		size: 5,
		speed: 1.8,
		colors: ['#F1F5F9', '#9CA3AF', '#475569'],
		glow: '#CBD5E1',
		phase: 0.3,
		trail: '#D8DEE9',
	},
	{
		radius: 92,
		size: 8,
		speed: 1.28,
		colors: ['#FFE5B4', '#F97316', '#7C2D12'],
		glow: '#FB923C',
		phase: 1.7,
		trail: '#FDBA74',
	},
	{
		radius: 132,
		size: 10,
		speed: 0.96,
		colors: ['#B9F6FF', '#0EA5E9', '#1E3A8A'],
		glow: '#38BDF8',
		phase: 2.75,
		trail: '#7DD3FC',
		moon: { distance: 19, size: 2.4, speed: 5.6, color: '#E2E8F0' },
	},
	{
		radius: 172,
		size: 7,
		speed: 0.78,
		colors: ['#FDBA74', '#DC2626', '#7F1D1D'],
		glow: '#F87171',
		phase: 4.2,
		trail: '#FCA5A5',
	},
	{
		radius: 214,
		size: 15,
		speed: 0.48,
		colors: ['#FDE68A', '#D97706', '#92400E'],
		glow: '#FBBF24',
		phase: 5.1,
		trail: '#FCD34D',
		moon: { distance: 27, size: 3, speed: 3.2, color: '#C7D2FE' },
	},
	{
		radius: 258,
		size: 12,
		speed: 0.38,
		colors: ['#FEF3C7', '#C084FC', '#581C87'],
		glow: '#C084FC',
		phase: 0.95,
		trail: '#DDD6FE',
		ring: { width: 46, height: 14, color: '#F5D0FE' },
	},
]

export const MIN_PLANETS = 1
export const MAX_PLANETS = PLANETS.length
export const SPEED_STEPS = [0.25, 0.5, 1, 2, 4, 8, 16, 32]
export const CONTROL_PANEL_BOTTOM_GAP = 8
export const STAR_COUNT = 72

export function buildStarLayers(count = STAR_COUNT): StarLayer[] {
	return Array.from({ length: count }, (_, i) => {
		const seed = (i * 9301 + 49297) % 233280
		const seed2 = (seed * 9301 + 49297) % 233280
		const seed3 = (seed2 * 9301 + 49297) % 233280

		return {
			x: seed / 233280,
			y: seed2 / 233280,
			r: 0.5 + (seed3 / 233280) * 1.6,
			opacity: 0.22 + ((seed + seed2) % 100) / 170,
			twinkle: 0.65 + (seed3 % 100) / 90,
		}
	})
}

export const STAR_LAYERS = buildStarLayers()

export const COMET_DUST: CometDustConfig[] = [
	{ offset: 0, size: 2.8, opacity: 0.7 },
	{ offset: 18, size: 2.1, opacity: 0.45 },
	{ offset: 34, size: 1.5, opacity: 0.28 },
	{ offset: 48, size: 1.1, opacity: 0.18 },
]
