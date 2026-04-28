import { useColorScheme } from 'react-native'
import { useThemeStore } from '@app/store/themeStore'

/**
 * Two palettes — light + dark. NativeWind className tokens auto-resolve via
 * CSS vars (set on root in `_layout.tsx`). Use `useThemeColors()` for raw
 * color values in JS (icons, scrim overlays, gesture-derived styles).
 */
export const lightColors = {
	'bg': '#FFFFFF',
	'bg-elevated': '#F2F2F7',
	'bg-grouped': '#F2F2F7',
	'surface': 'rgba(255, 255, 255, 0.72)',
	'surface-strong': 'rgba(255, 255, 255, 0.92)',
	'text': '#000000',
	'text-secondary': '#3C3C43',
	'text-muted': '#8E8E93',
	'text-on-accent': '#FFFFFF',
	'border': '#C6C6C8',
	'border-strong': '#A8A8AB',
	'separator': 'rgba(60, 60, 67, 0.36)',
	'accent': '#D97757',
	'accent-pressed': '#C66845',
	'accent-soft': 'rgba(217, 119, 87, 0.18)',
	'danger': '#FF3B30',
	'danger-soft': 'rgba(255, 59, 48, 0.18)',
	'success': '#34C759',
	'warning': '#FF9500',
	'skeleton': '#E5E5EA',
	'scrim': 'rgba(0, 0, 0, 0.5)',
	'scrim-soft': 'rgba(0, 0, 0, 0.32)',
} as const

export const darkColors = {
	'bg': '#1f1e1d',
	'bg-elevated': '#2b2a28',
	'bg-grouped': '#19181a',
	'surface': 'rgba(255, 255, 255, 0.04)',
	'surface-strong': 'rgba(255, 255, 255, 0.08)',
	'text': '#ededec',
	'text-secondary': '#a8a59f',
	'text-muted': '#757067',
	'text-on-accent': '#FFFFFF',
	'border': '#3a3835',
	'border-strong': '#4d4a45',
	'separator': 'rgba(255, 255, 255, 0.08)',
	'accent': '#d97757',
	'accent-pressed': '#c66845',
	'accent-soft': 'rgba(217, 119, 87, 0.18)',
	'danger': '#ef6f4f',
	'danger-soft': 'rgba(239, 111, 79, 0.18)',
	'success': '#6ec07a',
	'warning': '#d9a45c',
	'skeleton': '#3a3835',
	'scrim': 'rgba(0, 0, 0, 0.6)',
	'scrim-soft': 'rgba(0, 0, 0, 0.4)',
} as const

export type ThemeColors = typeof darkColors

/** Static fallback — defaults to dark. Prefer `useThemeColors()` in components. */
export const colors: ThemeColors = darkColors

const toRgbChannels = (color: string): string => {
	if (color.startsWith('#')) {
		const hex = color.slice(1)
		const r = parseInt(hex.slice(0, 2), 16)
		const g = parseInt(hex.slice(2, 4), 16)
		const b = parseInt(hex.slice(4, 6), 16)
		return `${r} ${g} ${b}`
	}
	const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
	if (!m) throw new Error(`unsupported color format: ${color}`)
	return `${m[1]} ${m[2]} ${m[3]}`
}

const toVars = (palette: Readonly<Record<string, string>>) =>
	Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--color-${k}`, toRgbChannels(v)]))

/**
 * NativeWind `vars()` payload — RGB channels only (`'r g b'`). Alpha from
 * palette entries is dropped on purpose; opacity belongs on Tailwind class
 * modifiers (e.g. `bg-bg-elevated/90`). Single source of truth with `lightColors` / `darkColors`.
 */
export const lightVars = toVars(lightColors)
export const darkVars = toVars(darkColors)

/** Resolves themeStore mode + device scheme to the active palette. */
export function useThemeColors(): ThemeColors {
	const mode = useThemeStore(s => s.mode)
	const deviceScheme = useColorScheme()
	const scheme = mode === 'system' ? (deviceScheme ?? 'dark') : mode
	return scheme === 'light' ? (lightColors as unknown as ThemeColors) : darkColors
}
