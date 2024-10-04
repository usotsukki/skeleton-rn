/**
 *
 * This ensures that text is vertically centered (as much as possible) avoiding
 * the need to manually correct text layouts at the screen level, e.g. by
 * adding different padding values for iOS and Android to a container. By
 * default, vertical text alignment is inconsistent cross-platform and text
 * elements are not optically centered in their container, so it's important
 * that these corrections are made at the lowest level possible and updated
 * whenever `fontSize` and/or `lineHeight` values are added or updated.
 * *
 */

export const typeHierarchy = {
	heading: {
		'18px / 21px': {
			fontSize: 18,
			letterSpacing: 0.6,
			lineHeight: 21,
			marginCorrection: {
				android: 0.2,
				ios: 0,
			},
		},
		'20px / 22px': {
			fontSize: 20,
			letterSpacing: 0.6,
			lineHeight: 22,
			marginCorrection: {
				android: 0,
				ios: -0.5,
			},
		},
		'23px / 27px': {
			fontSize: 23,
			letterSpacing: 0.6,
			lineHeight: 27,
			marginCorrection: {
				android: -0.3,
				ios: -0.3,
			},
		},
		'26px / 30px': {
			fontSize: 26,
			letterSpacing: 0.6,
			lineHeight: 30,
			marginCorrection: {
				android: -0.3,
				ios: -0.3,
			},
		},
		'28px / 33px': {
			fontSize: 28,
			letterSpacing: 0,
			lineHeight: 33,
			marginCorrection: {
				android: -0.3,
				ios: -0.3,
			},
		},
		'30px / 34px': {
			fontSize: 30,
			letterSpacing: 0.6,
			lineHeight: 34,
			marginCorrection: {
				android: 0,
				ios: 0.5,
			},
		},
		'34px / 41px': {
			fontSize: 34,
			letterSpacing: 0.6,
			lineHeight: 41,
			marginCorrection: {
				android: 0,
				ios: 0.5,
			},
		},
		'44px / 53px': {
			fontSize: 44,
			letterSpacing: 0.4,
			lineHeight: 53,
			marginCorrection: {
				android: 0,
				ios: 0.5,
			},
		},
	},
	text: {
		'11px / 13px': {
			fontSize: 11,
			letterSpacing: 0.6,
			lineHeight: 13,
			marginCorrection: {
				android: -0.3,
				ios: -0.3,
			},
		},
		'12px / 14px': {
			fontSize: 12,
			letterSpacing: 0.6,
			lineHeight: 14,
			marginCorrection: {
				android: -0.3,
				ios: -0.3,
			},
		},
		'14px / 19px': {
			fontSize: 14,
			letterSpacing: 0.6,
			lineHeight: 19,
			marginCorrection: {
				android: -0.1,
				ios: -0.3,
			},
		},
		'15px / 21px': {
			fontSize: 15,
			letterSpacing: 0.6,
			lineHeight: 21,
			marginCorrection: {
				android: 2.4,
				ios: -0.5,
			},
		},
		'16px / 22px': {
			fontSize: 16,
			letterSpacing: 0.6,
			lineHeight: 22,
			marginCorrection: {
				android: 2.4,
				ios: -0.5,
			},
		},
		'18px / 27px': {
			fontSize: 18,
			letterSpacing: 0.6,
			lineHeight: 27,
			marginCorrection: {
				android: 2.4,
				ios: -0.3,
			},
		},
		'20px / 24px': {
			fontSize: 20,
			letterSpacing: 0.6,
			lineHeight: 24,
			marginCorrection: {
				android: 0,
				ios: -0.5,
			},
		},
		'23px / 27px': {
			fontSize: 23,
			letterSpacing: 0.6,
			lineHeight: 27,
			marginCorrection: {
				android: -0.3,
				ios: -0.3,
			},
		},
		'11pt': {
			fontSize: 11,
			letterSpacing: 0.56,
			lineHeight: 14,
			marginCorrection: {
				android: 0.3,
				ios: 0,
			},
		},
		'12pt': {
			fontSize: 12,
			letterSpacing: 0.54,
			lineHeight: 16,
			marginCorrection: {
				android: 1,
				ios: 0,
			},
		},
		'13pt': {
			fontSize: 13,
			letterSpacing: 0.51,
			lineHeight: 18,
			marginCorrection: {
				android: 1.3,
				ios: 0,
			},
		},
		'13pt / 135%': {
			fontSize: 13,
			letterSpacing: 0.51,
			lineHeight: 13 * (135 / 100),
			marginCorrection: {
				android: 1.2,
				ios: 0,
			},
		},
		'13pt / 150%': {
			fontSize: 13,
			letterSpacing: 0.51,
			lineHeight: 13 * (150 / 100),
			marginCorrection: {
				android: 2,
				ios: 0,
			},
		},
		'15pt': {
			fontSize: 15,
			letterSpacing: 0.44,
			lineHeight: 20,
			marginCorrection: {
				android: 0.8,
				ios: 0,
			},
		},
		'15pt / 135%': {
			fontSize: 15,
			letterSpacing: 0.44,
			lineHeight: 15 * (135 / 100),
			marginCorrection: {
				android: 1,
				ios: 0,
			},
		},
		'15pt / 150%': {
			fontSize: 15,
			letterSpacing: 0.44,
			lineHeight: 15 * (150 / 100),
			marginCorrection: {
				android: 2,
				ios: 0,
			},
		},
		'17pt': {
			fontSize: 17,
			letterSpacing: 0.37,
			lineHeight: 22,
			marginCorrection: {
				android: 0.6,
				ios: -0.3,
			},
		},
		'17pt / 135%': {
			fontSize: 17,
			letterSpacing: 0.37,
			lineHeight: 17 * (135 / 100),
			marginCorrection: {
				android: 1.3,
				ios: 0,
			},
		},
		'17pt / 150%': {
			fontSize: 17,
			letterSpacing: 0.37,
			lineHeight: 17 * (150 / 100),
			marginCorrection: {
				android: 2.6,
				ios: -0.3,
			},
		},
		'20pt': {
			fontSize: 20,
			letterSpacing: 0.36,
			lineHeight: 24,
			marginCorrection: {
				android: 0.3,
				ios: -0.3,
			},
		},
		'20pt / 135%': {
			fontSize: 20,
			letterSpacing: 0.36,
			lineHeight: 20 * (135 / 100),
			marginCorrection: {
				android: 1.7,
				ios: 0,
			},
		},
		'20pt / 150%': {
			fontSize: 20,
			letterSpacing: 0.36,
			lineHeight: 20 * (150 / 100),
			marginCorrection: {
				android: 3.2,
				ios: -0.3,
			},
		},
		'22pt': {
			fontSize: 22,
			letterSpacing: 0.34,
			lineHeight: 28,
			marginCorrection: {
				android: 0.6,
				ios: -0.3,
			},
		},
		'26pt': {
			fontSize: 26,
			letterSpacing: 0.36,
			lineHeight: 32,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'30pt': {
			fontSize: 30,
			letterSpacing: 0.37,
			lineHeight: 37,
			marginCorrection: {
				android: 0.3,
				ios: -0.3,
			},
		},
		'34pt': {
			fontSize: 34,
			letterSpacing: 0.38,
			lineHeight: 41,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'44pt': {
			fontSize: 44,
			letterSpacing: 0.37,
			lineHeight: 52,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 9px': {
			fontSize: 9,
			letterSpacing: 0,
			lineHeight: 12,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 10px': {
			fontSize: 10,
			letterSpacing: 0,
			lineHeight: 12,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 11px': {
			fontSize: 11,
			letterSpacing: 0,
			lineHeight: 13,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 12px': {
			fontSize: 12,
			letterSpacing: 0,
			lineHeight: 14,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 13px': {
			fontSize: 13,
			letterSpacing: 0,
			lineHeight: 18,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 14px': {
			fontSize: 14,
			letterSpacing: 0,
			lineHeight: 19,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 15px': {
			fontSize: 15,
			letterSpacing: 0,
			lineHeight: 20,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 16px': {
			fontSize: 16,
			letterSpacing: 0,
			lineHeight: 22,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 17px': {
			fontSize: 17,
			letterSpacing: 0,
			lineHeight: 22,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 18px': {
			fontSize: 18,
			letterSpacing: 0,
			lineHeight: 22,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 19px': {
			fontSize: 19,
			letterSpacing: 0,
			lineHeight: 24,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 20px': {
			fontSize: 20,
			letterSpacing: 0,
			lineHeight: 24,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 23px': {
			fontSize: 23,
			letterSpacing: 0,
			lineHeight: 27,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 26px': {
			fontSize: 26,
			letterSpacing: 0,
			lineHeight: 32,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
		'icon 28px': {
			fontSize: 28,
			letterSpacing: 0,
			lineHeight: 33,
			marginCorrection: {
				android: 0,
				ios: 0,
			},
		},
	},
} as const

export type HeadingSize = keyof typeof typeHierarchy.heading
export type TextSize = keyof typeof typeHierarchy.text
