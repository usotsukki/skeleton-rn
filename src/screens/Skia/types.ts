import type { SharedValue } from 'react-native-reanimated'

export interface MoonConfig {
	distance: number
	size: number
	speed: number
	color: string
}

export interface RingConfig {
	width: number
	height: number
	color: string
}

export interface PlanetConfig {
	radius: number
	size: number
	speed: number
	colors: [string, string, string]
	glow: string
	phase: number
	trail: string
	moon?: MoonConfig
	ring?: RingConfig
}

export interface StarLayer {
	x: number
	y: number
	r: number
	opacity: number
	twinkle: number
}

export interface CometDustConfig {
	offset: number
	size: number
	opacity: number
}

export interface SceneCenter {
	cx: number
	cy: number
}

export interface AnimatedSceneProps extends SceneCenter {
	time: SharedValue<number>
	speed: number
}
