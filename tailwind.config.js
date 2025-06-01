import { colors } from './src/theme/designSystem/colors'

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: colors,
			fontFamily: {
				sfProRounded: ['SF Pro Rounded', 'sans-serif'],
				sfMono: ['SF Mono', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
