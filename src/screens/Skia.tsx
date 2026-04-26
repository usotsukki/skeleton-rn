import { Canvas, Circle, LinearGradient, vec } from '@shopify/react-native-skia'
import { Minus, Pause, Play, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { type SharedValue, useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated'
import { AppText } from '@app/components/shared'
import { colors } from '@app/theme/colors'

interface PlanetConfig {
	radius: number
	size: number
	speed: number
	color: string
}

const PLANETS: PlanetConfig[] = [
	{ radius: 60, size: 5, speed: 1.6, color: '#A1A1A6' },
	{ radius: 95, size: 8, speed: 1.2, color: '#E08011' },
	{ radius: 135, size: 9, speed: 1.0, color: '#007AFF' },
	{ radius: 175, size: 7, speed: 0.78, color: '#FF3B30' },
	{ radius: 220, size: 14, speed: 0.5, color: '#FFB347' },
	{ radius: 265, size: 12, speed: 0.4, color: '#D4A24C' },
]

const MIN_PLANETS = 1
const MAX_PLANETS = PLANETS.length
const SPEED_STEPS = [0.25, 0.5, 1, 2, 4, 8, 16, 32]

export default function Skia() {
	const { t } = useTranslation()
	const { width } = useWindowDimensions()
	const cx = width / 2
	const cy = 320
	const [planetCount, setPlanetCount] = useState(4)
	const [speedIndex, setSpeedIndex] = useState(2)
	const [paused, setPaused] = useState(false)

	const time = useSharedValue(0)
	useFrameCallback(frame => {
		'worklet'
		if (paused) return
		time.value += frame.timeSincePreviousFrame ?? 0
	})

	const speed = SPEED_STEPS[speedIndex]
	const visiblePlanets = PLANETS.slice(0, planetCount)

	return (
		<View className="flex-1 bg-bg">
			<Canvas style={{ flex: 1 }}>
				<Circle cx={cx} cy={cy} r={28}>
					<LinearGradient colors={['#FFD60A', '#FF9500']} end={vec(cx + 28, cy + 28)} start={vec(cx - 28, cy - 28)} />
				</Circle>

				{visiblePlanets.map((planet, i) => (
					<Orbit cx={cx} cy={cy} key={i} planet={planet} speed={speed} time={time} />
				))}
			</Canvas>

			<View className="absolute bottom-6 left-4 right-4 gap-3 rounded-3xl border border-separator bg-bg-elevated/90 p-4">
				<KnobRow
					disabledMinus={planetCount <= MIN_PLANETS}
					disabledPlus={planetCount >= MAX_PLANETS}
					label={t('skiaScreen.planets')}
					onMinus={() => setPlanetCount(c => Math.max(MIN_PLANETS, c - 1))}
					onPlus={() => setPlanetCount(c => Math.min(MAX_PLANETS, c + 1))}
					value={String(planetCount)}
				/>
				<KnobRow
					disabledMinus={speedIndex <= 0}
					disabledPlus={speedIndex >= SPEED_STEPS.length - 1}
					label={t('skiaScreen.speed')}
					onMinus={() => setSpeedIndex(i => Math.max(0, i - 1))}
					onPlus={() => setSpeedIndex(i => Math.min(SPEED_STEPS.length - 1, i + 1))}
					value={`${speed}×`}
				/>
				<Pressable
					accessibilityRole="button"
					className="flex-row items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 active:opacity-80"
					onPress={() => setPaused(p => !p)}>
					{paused ? <Play color="#fff" fill="#fff" size={16} /> : <Pause color="#fff" fill="#fff" size={16} />}
					<AppText className="text-text-on-accent" variant="btn">
						{paused ? t('skiaScreen.resume') : t('skiaScreen.pause')}
					</AppText>
				</Pressable>
			</View>
		</View>
	)
}

function KnobRow({
	label,
	value,
	onMinus,
	onPlus,
	disabledMinus,
	disabledPlus,
}: {
	label: string
	value: string
	onMinus: () => void
	onPlus: () => void
	disabledMinus?: boolean
	disabledPlus?: boolean
}) {
	return (
		<View className="flex-row items-center justify-between">
			<AppText className="text-text-muted" variant="cap">
				{label.toUpperCase()}
			</AppText>
			<View className="flex-row items-center gap-3">
				<KnobButton disabled={disabledMinus} onPress={onMinus}>
					<Minus color={colors['text']} size={18} />
				</KnobButton>
				<AppText className="w-14 text-center text-text" variant="tmed">
					{value}
				</AppText>
				<KnobButton disabled={disabledPlus} onPress={onPlus}>
					<Plus color={colors['text']} size={18} />
				</KnobButton>
			</View>
		</View>
	)
}

function Orbit({
	planet,
	cx,
	cy,
	time,
	speed,
}: {
	planet: PlanetConfig
	cx: number
	cy: number
	time: SharedValue<number>
	speed: number
}) {
	const cxAnim = useDerivedValue(() => {
		const t = (time.value / 1000) * planet.speed * speed
		return cx + planet.radius * Math.cos(t)
	})
	const cyAnim = useDerivedValue(() => {
		const t = (time.value / 1000) * planet.speed * speed
		return cy + planet.radius * Math.sin(t)
	})

	return (
		<>
			<Circle color="rgba(255,255,255,0.06)" cx={cx} cy={cy} r={planet.radius} strokeWidth={1} style="stroke" />
			<Circle color={planet.color} cx={cxAnim} cy={cyAnim} r={planet.size} />
		</>
	)
}

function KnobButton({
	children,
	onPress,
	disabled,
}: {
	children: React.ReactNode
	onPress: () => void
	disabled?: boolean
}) {
	return (
		<Pressable
			accessibilityRole="button"
			className={`h-9 w-9 items-center justify-center rounded-full bg-bg ${disabled ? 'opacity-40' : 'active:opacity-70'}`}
			disabled={disabled}
			onPress={onPress}>
			{children}
		</Pressable>
	)
}
