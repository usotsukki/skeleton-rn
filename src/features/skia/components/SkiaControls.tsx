import { Minus, Pause, Play, Plus } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useThemeColors } from '@app/shared/theme/colors'
import { AppText } from '@app/shared/ui'

interface SkiaControlsProps {
	planetLabel: string
	planetValue: string
	planetMinusDisabled: boolean
	planetPlusDisabled: boolean
	onPlanetMinus: () => void
	onPlanetPlus: () => void
	speedLabel: string
	speedValue: string
	speedMinusDisabled: boolean
	speedPlusDisabled: boolean
	onSpeedMinus: () => void
	onSpeedPlus: () => void
	paused: boolean
	pauseLabel: string
	resumeLabel: string
	onTogglePaused: () => void
	bottom: number
}

export function SkiaControls({
	planetLabel,
	planetValue,
	planetMinusDisabled,
	planetPlusDisabled,
	onPlanetMinus,
	onPlanetPlus,
	speedLabel,
	speedValue,
	speedMinusDisabled,
	speedPlusDisabled,
	onSpeedMinus,
	onSpeedPlus,
	paused,
	pauseLabel,
	resumeLabel,
	onTogglePaused,
	bottom,
}: SkiaControlsProps) {
	const onAccent = useThemeColors()['text-on-accent']
	return (
		<View
			className="absolute left-4 right-4 gap-3 rounded-3xl border border-separator bg-bg-elevated/90 p-4"
			style={{ bottom }}>
			<KnobRow
				disabledMinus={planetMinusDisabled}
				disabledPlus={planetPlusDisabled}
				label={planetLabel}
				onMinus={onPlanetMinus}
				onPlus={onPlanetPlus}
				value={planetValue}
			/>
			<KnobRow
				disabledMinus={speedMinusDisabled}
				disabledPlus={speedPlusDisabled}
				label={speedLabel}
				onMinus={onSpeedMinus}
				onPlus={onSpeedPlus}
				value={speedValue}
			/>
			<Pressable
				accessibilityRole="button"
				className="flex-row items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 active:opacity-80"
				onPress={onTogglePaused}>
				{paused ? (
					<Play color={onAccent} fill={onAccent} size={16} />
				) : (
					<Pause color={onAccent} fill={onAccent} size={16} />
				)}
				<AppText className="text-text-on-accent" variant="btn">
					{paused ? resumeLabel : pauseLabel}
				</AppText>
			</Pressable>
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
	const colors = useThemeColors()
	const { t } = useTranslation()
	return (
		<View className="flex-row items-center justify-between">
			<AppText className="text-text-muted" variant="cap">
				{label.toUpperCase()}
			</AppText>
			<View className="flex-row items-center gap-3">
				<KnobButton a11yLabel={t('a11y.decrease', { label })} disabled={disabledMinus} onPress={onMinus}>
					<Minus color={colors.text} size={18} />
				</KnobButton>
				<AppText className="w-14 text-center text-text" variant="tmed">
					{value}
				</AppText>
				<KnobButton a11yLabel={t('a11y.increase', { label })} disabled={disabledPlus} onPress={onPlus}>
					<Plus color={colors.text} size={18} />
				</KnobButton>
			</View>
		</View>
	)
}

// 36pt circle + 4pt slop on each side = 44pt touch target.
const KNOB_HIT_SLOP = 4

function KnobButton({
	children,
	onPress,
	disabled,
	a11yLabel,
}: {
	children: ReactNode
	onPress: () => void
	disabled?: boolean
	a11yLabel: string
}) {
	return (
		<Pressable
			accessibilityLabel={a11yLabel}
			accessibilityRole="button"
			accessibilityState={{ disabled: !!disabled }}
			hitSlop={KNOB_HIT_SLOP}
			className={`h-9 w-9 items-center justify-center rounded-full bg-bg ${disabled ? 'opacity-40' : 'active:opacity-70'}`}
			disabled={disabled}
			onPress={onPress}>
			{children}
		</Pressable>
	)
}
