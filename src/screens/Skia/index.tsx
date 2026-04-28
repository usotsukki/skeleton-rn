import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, View } from 'react-native'
import { useFrameCallback, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SkiaControls } from './SkiaControls'
import { CONTROL_PANEL_BOTTOM_GAP, MAX_PLANETS, MIN_PLANETS, PLANETS, SPEED_STEPS } from './skiaDemoConfig'
import { SolarSystemCanvas } from './SolarSystemCanvas'

export default function Skia() {
	const { t } = useTranslation()
	const { height, width } = useWindowDimensions()
	const insets = useSafeAreaInsets()
	const [planetCount, setPlanetCount] = useState(4)
	const [speedIndex, setSpeedIndex] = useState(2)
	const [paused, setPaused] = useState(false)

	const time = useSharedValue(0)
	useFrameCallback(frame => {
		'worklet'
		if (paused) return
		time.value += frame.timeSincePreviousFrame ?? 0
	})

	const cx = width / 2
	const cy = Math.min(height * 0.4, 330)
	const speed = SPEED_STEPS[speedIndex]
	const visiblePlanets = PLANETS.slice(0, planetCount)

	return (
		<View className="flex-1 bg-bg">
			<SolarSystemCanvas
				width={width}
				height={height}
				cx={cx}
				cy={cy}
				planets={visiblePlanets}
				speed={speed}
				time={time}
			/>
			<SkiaControls
				bottom={insets.bottom + CONTROL_PANEL_BOTTOM_GAP}
				onPlanetMinus={() => setPlanetCount(c => Math.max(MIN_PLANETS, c - 1))}
				onPlanetPlus={() => setPlanetCount(c => Math.min(MAX_PLANETS, c + 1))}
				onSpeedMinus={() => setSpeedIndex(i => Math.max(0, i - 1))}
				onSpeedPlus={() => setSpeedIndex(i => Math.min(SPEED_STEPS.length - 1, i + 1))}
				onTogglePaused={() => setPaused(p => !p)}
				paused={paused}
				pauseLabel={t('skiaScreen.pause')}
				planetLabel={t('skiaScreen.planets')}
				planetMinusDisabled={planetCount <= MIN_PLANETS}
				planetPlusDisabled={planetCount >= MAX_PLANETS}
				planetValue={String(planetCount)}
				resumeLabel={t('skiaScreen.resume')}
				speedLabel={t('skiaScreen.speed')}
				speedMinusDisabled={speedIndex <= 0}
				speedPlusDisabled={speedIndex >= SPEED_STEPS.length - 1}
				speedValue={`${speed}×`}
			/>
		</View>
	)
}
