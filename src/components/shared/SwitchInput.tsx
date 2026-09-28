import * as Switch from '@rn-primitives/switch'
import { StyleSheet, View } from 'react-native'
import { useThemeColors } from '@app/theme/colors'
import { cn } from '@app/utils'
import AppText from './AppText'

const TOGGLE_HIT_SLOP = { top: 9, bottom: 9, left: 4, right: 4 } as const

interface SwitchInputProps {
	label: string
	value: boolean
	onValueChange: (value: boolean) => void
	disabled?: boolean
	containerClassName?: string
	testID?: string
}

export function SwitchInput({ label, value, onValueChange, disabled, containerClassName, testID }: SwitchInputProps) {
	return (
		<View
			className={cn('h-[56px] flex-row items-center justify-between', disabled && 'opacity-50', containerClassName)}>
			<AppText className="text-text" variant="tmed">
				{label}
			</AppText>
			<Toggle
				accessibilityLabel={label}
				disabled={disabled}
				onValueChange={onValueChange}
				testID={testID}
				value={value}
			/>
		</View>
	)
}

interface ToggleProps extends Omit<SwitchInputProps, 'label' | 'containerClassName'> {
	/** The visible label it sits next to (e.g. a `ListRow` title). */
	accessibilityLabel: string
}

/** The bare switch, for rows that render their own label (`<ListRow trailing={<Toggle … />} />`). */
export function Toggle({ accessibilityLabel, value, onValueChange, disabled, testID }: ToggleProps) {
	const colors = useThemeColors()
	return (
		<Switch.Root
			accessibilityLabel={accessibilityLabel}
			checked={value}
			disabled={disabled}
			// 31pt track: the slop brings the target to 49pt (>= 44pt / 48dp).
			hitSlop={TOGGLE_HIT_SLOP}
			onCheckedChange={onValueChange}
			style={[styles.track, { backgroundColor: value ? colors.accent : colors.border }]}
			testID={testID}>
			<Switch.Thumb style={[styles.thumb, { transform: [{ translateX: value ? 22 : 2 }] }]} />
		</Switch.Root>
	)
}

const styles = StyleSheet.create({
	track: { height: 31, width: 51, borderRadius: 16 },
	// Shadow keeps the white thumb visible on the light-mode off track (like the native iOS switch).
	thumb: {
		position: 'absolute',
		top: 2,
		height: 27,
		width: 27,
		borderRadius: 14,
		backgroundColor: '#FFFFFF',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.25,
		shadowRadius: 2,
		elevation: 2,
	},
})
