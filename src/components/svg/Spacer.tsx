import * as React from 'react'
import { View } from 'react-native'
import Svg, { Defs, G, LinearGradient, Path, Stop, SvgProps } from 'react-native-svg'
import AppText from '../shared/AppText'

export type SpacerProps = SvgProps & {
	label?: string
}

const Spacer = ({ label, ...props }: SpacerProps) => (
	<View className="w-full items-center justify-center py-4">
		<Svg fill="none" width={388} height={1} {...props}>
			<G opacity={0.4} strokeLinecap="round">
				<Path stroke="url(#a)" d="M230.5.5h157" />
				<Path transform="matrix(-1 0 0 1 158 1)" stroke="url(#b)" d="M.5-.5h157" />
			</G>
			<Defs>
				<LinearGradient gradientUnits="userSpaceOnUse" id="a" x1={228.5} x2={382} y1={1} y2={1}>
					<Stop stopColor="#8E8E93" />
					<Stop offset={1} stopColor="#8E8E93" stopOpacity={0} />
				</LinearGradient>
				<LinearGradient gradientUnits="userSpaceOnUse" id="b" x1={-1.5} x2={152} y1={0} y2={0}>
					<Stop stopColor="#8E8E93" />
					<Stop offset={1} stopColor="#8E8E93" stopOpacity={0} />
				</LinearGradient>
			</Defs>
		</Svg>
		{label && (
			<AppText className="absolute bg-bg px-3 text-text-muted" variant="capm">
				{label}
			</AppText>
		)}
	</View>
)
export default Spacer
