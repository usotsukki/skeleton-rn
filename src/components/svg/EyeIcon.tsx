import * as React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

export default function EyeIcon({ ...props }: SvgProps) {
	return (
		<Svg fill="none" width={props.width || 24} height={props.height || 24} {...props}>
			<Path
				stroke={props.color}
				d="M10.585 10.587a2 2 0 1 0 2.83 2.828"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
			/>
			<Path
				stroke={props.color}
				d="M16.681 16.673A8.717 8.717 0 0 1 12 18c-3.6 0-6.6-2-9-6 1.272-2.12 2.712-3.678 4.32-4.674m2.86-1.146A9.054 9.054 0 0 1 12 6c3.6 0 6.6 2 9 6-.666 1.11-1.379 2.067-2.138 2.87"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
			/>
			<Path fill={props.color} d="m3 3 18 18L3 3Z" />
			<Path stroke={props.color} d="m3 3 18 18" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} />
		</Svg>
	)
}
