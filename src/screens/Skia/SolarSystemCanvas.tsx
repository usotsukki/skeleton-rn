import {
	BlurMask,
	Canvas,
	Circle,
	Fill,
	Group,
	LinearGradient,
	Oval,
	RadialGradient,
	SweepGradient,
	vec,
} from '@shopify/react-native-skia'
import { type SharedValue, useDerivedValue } from 'react-native-reanimated'
import { COMET_DUST, STAR_LAYERS } from './skiaDemoConfig'
import type { AnimatedSceneProps, CometDustConfig, MoonConfig, PlanetConfig, RingConfig, StarLayer } from './types'

interface SolarSystemCanvasProps extends AnimatedSceneProps {
	width: number
	height: number
	planets: PlanetConfig[]
}

export function SolarSystemCanvas({ width, height, cx, cy, planets, time, speed }: SolarSystemCanvasProps) {
	return (
		<Canvas style={{ flex: 1 }}>
			<SpaceBackdrop width={width} height={height} time={time} />
			<SolarCorona cx={cx} cy={cy} time={time} />

			{planets.map((planet, i) => (
				<Orbit cx={cx} cy={cy} key={i} planet={planet} speed={speed} time={time} />
			))}

			<Comet cx={cx} cy={cy} speed={speed} time={time} />
		</Canvas>
	)
}

function SpaceBackdrop({ width, height, time }: { width: number; height: number; time: SharedValue<number> }) {
	return (
		<>
			<Fill>
				<LinearGradient
					colors={['#020617', '#090D1F', '#111827', '#020617']}
					end={vec(width, height)}
					start={vec(0, 0)}
				/>
			</Fill>
			<Circle opacity={0.38} cx={width * 0.18} cy={height * 0.22} r={190}>
				<RadialGradient
					c={vec(width * 0.18, height * 0.22)}
					colors={['rgba(56,189,248,0.35)', 'rgba(99,102,241,0.08)', 'rgba(2,6,23,0)']}
					r={190}
				/>
			</Circle>
			<Circle opacity={0.32} cx={width * 0.86} cy={height * 0.34} r={210}>
				<RadialGradient
					c={vec(width * 0.86, height * 0.34)}
					colors={['rgba(244,114,182,0.24)', 'rgba(168,85,247,0.08)', 'rgba(2,6,23,0)']}
					r={210}
				/>
			</Circle>
			{STAR_LAYERS.map((star, i) => (
				<Star width={width} height={height} key={i} star={star} time={time} />
			))}
		</>
	)
}

function Star({
	star,
	width,
	height,
	time,
}: {
	star: StarLayer
	width: number
	height: number
	time: SharedValue<number>
}) {
	const opacity = useDerivedValue(() => {
		const pulse = 0.65 + Math.sin(time.value / 900 + star.twinkle * 4) * 0.35
		return star.opacity * pulse
	})

	return <Circle color="#F8FAFC" opacity={opacity} cx={star.x * width} cy={star.y * height} r={star.r} />
}

function SolarCorona({ cx, cy, time }: Omit<AnimatedSceneProps, 'speed'>) {
	const flare = useDerivedValue(() => 0.76 + Math.sin(time.value / 650) * 0.13)
	const pulse = useDerivedValue(() => 33 + Math.sin(time.value / 420) * 3)

	return (
		<Group>
			<Circle opacity={0.48} cx={cx} cy={cy} r={90}>
				<RadialGradient
					c={vec(cx, cy)}
					colors={['rgba(255,214,10,0.44)', 'rgba(249,115,22,0.15)', 'rgba(2,6,23,0)']}
					r={90}
				/>
				<BlurMask blur={18} respectCTM={false} style="normal" />
			</Circle>
			<Circle opacity={flare} cx={cx} cy={cy} r={52}>
				<SweepGradient c={vec(cx, cy)} colors={['#FDE68A', '#FB923C', '#EF4444', '#FACC15', '#FDE68A']} />
				<BlurMask blur={8} respectCTM={false} style="solid" />
			</Circle>
			<Circle cx={cx} cy={cy} r={pulse}>
				<RadialGradient
					c={vec(cx - 10, cy - 12)}
					colors={['#FFF7AD', '#FFD60A', '#F97316', '#7C2D12']}
					positions={[0, 0.34, 0.78, 1]}
					r={42}
				/>
			</Circle>
			<Circle color="rgba(255,255,255,0.76)" cx={cx - 10} cy={cy - 12} r={5} />
		</Group>
	)
}

function Orbit({ planet, cx, cy, time, speed }: AnimatedSceneProps & { planet: PlanetConfig }) {
	const cxAnim = useDerivedValue(() => {
		const t = (time.value / 1000) * planet.speed * speed + planet.phase
		return cx + planet.radius * Math.cos(t)
	})
	const cyAnim = useDerivedValue(() => {
		const t = (time.value / 1000) * planet.speed * speed + planet.phase
		return cy + planet.radius * Math.sin(t)
	})
	const glow = useDerivedValue(() => 0.26 + Math.sin(time.value / 720 + planet.phase) * 0.08)
	const highlightX = useDerivedValue(() => cxAnim.value - planet.size * 0.35)
	const highlightY = useDerivedValue(() => cyAnim.value - planet.size * 0.42)
	const shadowX = useDerivedValue(() => cxAnim.value + planet.size * 0.24)
	const shadowY = useDerivedValue(() => cyAnim.value + planet.size * 0.28)
	const gradientCenter = useDerivedValue(() => vec(cxAnim.value - planet.size * 0.38, cyAnim.value - planet.size * 0.4))

	return (
		<>
			<OrbitGuide cx={cx} cy={cy} planet={planet} />
			<TrailDot cx={cx} cy={cy} planet={planet} speed={speed} time={time} />
			{planet.ring && <PlanetRing cx={cxAnim} cy={cyAnim} ring={planet.ring} />}
			<Circle color={planet.glow} opacity={glow} cx={cxAnim} cy={cyAnim} r={planet.size * 2.5}>
				<BlurMask blur={7} respectCTM={false} style="normal" />
			</Circle>
			<Circle cx={cxAnim} cy={cyAnim} r={planet.size}>
				<RadialGradient c={gradientCenter} colors={planet.colors} r={planet.size * 2.4} />
			</Circle>
			<Circle color="rgba(255,255,255,0.62)" cx={highlightX} cy={highlightY} r={Math.max(1.5, planet.size * 0.24)} />
			<Circle color="rgba(0,0,0,0.18)" cx={shadowX} cy={shadowY} r={planet.size * 0.52} />
			{planet.moon && (
				<Moon cx={cxAnim} cy={cyAnim} moon={planet.moon} phase={planet.phase} speed={speed} time={time} />
			)}
		</>
	)
}

function OrbitGuide({ cx, cy, planet }: { cx: number; cy: number; planet: PlanetConfig }) {
	return (
		<>
			<Circle color="rgba(255,255,255,0.08)" cx={cx} cy={cy} r={planet.radius} strokeWidth={1} style="stroke" />
			<Circle opacity={0.2} cx={cx} cy={cy} r={planet.radius} strokeWidth={1.6} style="stroke">
				<SweepGradient
					c={vec(cx, cy)}
					colors={['rgba(255,255,255,0)', planet.trail, 'rgba(255,255,255,0)', 'rgba(255,255,255,0)']}
				/>
			</Circle>
		</>
	)
}

function TrailDot({ planet, cx, cy, time, speed }: AnimatedSceneProps & { planet: PlanetConfig }) {
	const trailX = useDerivedValue(() => {
		const t = (time.value / 1000) * planet.speed * speed + planet.phase - 0.34
		return cx + planet.radius * Math.cos(t)
	})
	const trailY = useDerivedValue(() => {
		const t = (time.value / 1000) * planet.speed * speed + planet.phase - 0.34
		return cy + planet.radius * Math.sin(t)
	})

	return <Circle color={planet.trail} opacity={0.42} cx={trailX} cy={trailY} r={Math.max(1.5, planet.size * 0.24)} />
}

function PlanetRing({ cx, cy, ring }: { cx: SharedValue<number>; cy: SharedValue<number>; ring: RingConfig }) {
	const x = useDerivedValue(() => cx.value - ring.width / 2)
	const y = useDerivedValue(() => cy.value - ring.height / 2)

	return (
		<Oval
			color={ring.color}
			opacity={0.78}
			width={ring.width}
			height={ring.height}
			strokeWidth={2}
			style="stroke"
			x={x}
			y={y}
		/>
	)
}

function Moon({
	moon,
	cx,
	cy,
	time,
	speed,
	phase,
}: {
	moon: MoonConfig
	cx: SharedValue<number>
	cy: SharedValue<number>
	time: SharedValue<number>
	speed: number
	phase: number
}) {
	const moonX = useDerivedValue(() => {
		const t = (time.value / 1000) * moon.speed * speed + phase
		return cx.value + moon.distance * Math.cos(t)
	})
	const moonY = useDerivedValue(() => {
		const t = (time.value / 1000) * moon.speed * speed + phase
		return cy.value + moon.distance * Math.sin(t) * 0.72
	})

	return (
		<>
			<Circle color="rgba(255,255,255,0.16)" cx={cx} cy={cy} r={moon.distance} strokeWidth={0.6} style="stroke" />
			<Circle color={moon.color} cx={moonX} cy={moonY} r={moon.size} />
		</>
	)
}

function Comet({ cx, cy, time, speed }: AnimatedSceneProps) {
	const cometRadius = 306

	return (
		<>
			{COMET_DUST.map(dust => (
				<CometDust cx={cx} cy={cy} dust={dust} key={dust.offset} radius={cometRadius} speed={speed} time={time} />
			))}
		</>
	)
}

function CometDust({
	dust,
	cx,
	cy,
	radius,
	time,
	speed,
}: AnimatedSceneProps & {
	dust: CometDustConfig
	radius: number
}) {
	const x = useDerivedValue(() => {
		const t = (time.value / 1300) * speed + 2.2 - dust.offset / 100
		return cx + radius * Math.cos(t)
	})
	const y = useDerivedValue(() => {
		const t = (time.value / 1300) * speed + 2.2 - dust.offset / 100
		return cy + radius * Math.sin(t) * 0.74
	})

	return <Circle color="#E0F2FE" opacity={dust.opacity} cx={x} cy={y} r={dust.size} />
}
