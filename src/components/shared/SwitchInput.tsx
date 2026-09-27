import * as Switch from '@rn-primitives/switch'
import { StyleSheet, View } from 'react-native'
import { useThemeColors } from '@app/theme/colors'
import { cn } from '@app/utils'
import AppText from './AppText'

interface SwitchInputProps {
	label: string
	value: boolean
	onValueChange: (value: boolean) => void
	disabled?: boolean
	containerClassName?: string
	testID?: string
}

export function SwitchInput({ label, value, onValueChange, disabled, containerClassName, testID }: SwitchInputProps) {
	const colors = useThemeColors()
	return (
		<View
			className={cn('h-[56px] flex-row items-center justify-between', disabled && 'opacity-50', containerClassName)}>
			<AppText className="text-text" variant="tmed">
				{label}
			</AppText>
			<Switch.Root
				checked={value}
				disabled={disabled}
				onCheckedChange={onValueChange}
				style={[styles.track, { backgroundColor: value ? colors.accent : colors.border }]}
				testID={testID}>
				<Switch.Thumb style={[styles.thumb, { transform: [{ translateX: value ? 22 : 2 }] }]} />
			</Switch.Root>
		</View>
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
