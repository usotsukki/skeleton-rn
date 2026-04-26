import { View } from 'react-native'
import { cn } from '@app/utils'
import AppButton from './AppButton'
import AppText from './AppText'

interface FormSubmitFooterProps {
	errorMessage?: string
	disabled: boolean
	onPress: () => void
	label: string
	submitTestID?: string
	onDeletePress?: () => void
	deleteLabel?: string
	deleteTestID?: string
	containerClassName?: string
}

export function FormSubmitFooter({
	errorMessage,
	containerClassName,
	disabled,
	onPress,
	label,
	submitTestID,
	onDeletePress,
	deleteLabel,
	deleteTestID,
}: FormSubmitFooterProps) {
	return (
		<View className={cn('mt-6', containerClassName)}>
			<View className="mb-1 h-5 items-center justify-center">
				{errorMessage ? (
					<AppText className="text-center text-danger" numberOfLines={1} variant="ts">
						{errorMessage}
					</AppText>
				) : null}
			</View>
			<View className="gap-3">
				<AppButton disabled={disabled} fullWidth onPress={onPress} testID={submitTestID}>
					{label}
				</AppButton>
				{onDeletePress && deleteLabel ? (
					<AppButton onPress={onDeletePress} testID={deleteTestID} variant="destructive">
						{deleteLabel}
					</AppButton>
				) : null}
			</View>
		</View>
	)
}
