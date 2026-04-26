import Checkbox, { CheckboxProps } from 'expo-checkbox'
import { StyleSheet, View } from 'react-native'
import { colors } from '@app/theme/colors'
import { cn } from '@app/utils'
import AppText from './AppText'

interface CheckboxInputProps extends CheckboxProps {
	containerClassName?: string
	label?: string
}

export default function CheckboxInput({ containerClassName, label, ...props }: CheckboxInputProps) {
	return (
		<View className={cn('flex-row items-center gap-2', containerClassName)}>
			<Checkbox color={colors['accent']} style={styles.checkbox} {...props} />
			{label && (
				<AppText className="text-text-secondary" variant="ts">
					{label}
				</AppText>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	checkbox: {
		width: 18,
		height: 18,
		borderRadius: 4,
	},
})
