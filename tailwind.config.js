/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				'bg': 'rgb(var(--color-bg) / <alpha-value>)',
				'bg-elevated': 'rgb(var(--color-bg-elevated) / <alpha-value>)',
				'bg-grouped': 'rgb(var(--color-bg-grouped) / <alpha-value>)',
				'surface': 'rgb(var(--color-surface) / 0.04)',
				'surface-strong': 'rgb(var(--color-surface-strong) / 0.08)',
				'text': 'rgb(var(--color-text) / <alpha-value>)',
				'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
				'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
				'text-on-accent': 'rgb(var(--color-text-on-accent) / <alpha-value>)',
				'border': 'rgb(var(--color-border) / <alpha-value>)',
				'border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',
				'separator': 'rgb(var(--color-separator) / 0.18)',
				'accent': 'rgb(var(--color-accent) / <alpha-value>)',
				'accent-pressed': 'rgb(var(--color-accent-pressed) / <alpha-value>)',
				'accent-soft': 'rgb(var(--color-accent-soft) / 0.18)',
				'danger': 'rgb(var(--color-danger) / <alpha-value>)',
				'danger-soft': 'rgb(var(--color-danger-soft) / 0.18)',
				'success': 'rgb(var(--color-success) / <alpha-value>)',
				'warning': 'rgb(var(--color-warning) / <alpha-value>)',
				'skeleton': 'rgb(var(--color-skeleton) / <alpha-value>)',
				'scrim': 'rgb(var(--color-scrim) / 0.6)',
				'scrim-soft': 'rgb(var(--color-scrim-soft) / 0.4)',
			},
			fontFamily: {
				sans: ['System'],
				mono: ['Menlo', 'monospace'],
			},
		},
	},
	plugins: [],
}
