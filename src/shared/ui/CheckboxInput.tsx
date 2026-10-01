import Checkbox from 'expo-checkbox'
import { Pressable, StyleSheet, View } from 'react-native'
import { useThemeColors } from '@app/shared/theme/colors'
import { cn } from '@app/shared/utils'
import AppText from './AppText'

interface CheckboxInputProps {
	value: boolean
	onValueChange: (value: boolean) => void
	/** Visible text next to the box; also its accessibility label. */
	label: string
	disabled?: boolean
	containerClassName?: string
	testID?: string
}

/**
 * The box and its label are one control: tapping either toggles it, the row is at least 48pt tall, and
 * screen readers hear a single checkbox with its label and state.
 */
export default function CheckboxInput({
	value,
	onValueChange,
	label,
	disabled,
	containerClassName,
	testID,
}: CheckboxInputProps) {
	const colors = useThemeColors()
	return (
		<Pressable
			accessibilityLabel={label}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: value, disabled }}
			className={cn('min-h-[48px] flex-row items-center gap-2', disabled && 'opacity-50', containerClassName)}
			disabled={disabled}
			onPress={() => onValueChange(!value)}
			testID={testID}>
			{/* The native box only draws the state; the row handles touches and accessibility. */}
			<View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden pointerEvents="none">
				<Checkbox color={colors.accent} style={styles.checkbox} value={value} />
			</View>
			<AppText className="text-text-secondary" variant="ts">
				{label}
			</AppText>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	checkbox: {
		width: 18,
		height: 18,
		borderRadius: 4,
	},
})
