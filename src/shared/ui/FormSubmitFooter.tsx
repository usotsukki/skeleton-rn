import { useEffect } from 'react'
import { AccessibilityInfo, Platform, View } from 'react-native'
import { cn } from '@app/shared/utils'
import AppButton from './AppButton'
import AppText from './AppText'

interface FormSubmitFooterProps {
	/** Why the last submit failed; shown above the button and announced to screen readers. */
	errorMessage?: string
	disabled: boolean
	/** Spinner on the submit button while the request runs. */
	loading?: boolean
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
	loading,
	onPress,
	label,
	submitTestID,
	onDeletePress,
	deleteLabel,
	deleteTestID,
}: FormSubmitFooterProps) {
	// accessibilityLiveRegion is Android-only.
	useEffect(() => {
		if (Platform.OS === 'ios' && errorMessage) AccessibilityInfo.announceForAccessibility(errorMessage)
	}, [errorMessage])

	return (
		<View className={cn('mt-6', containerClassName)}>
			<View accessibilityLiveRegion="polite" className="mb-2 min-h-5 items-center justify-center">
				{errorMessage ? (
					<AppText accessibilityRole="alert" className="text-center text-danger" testID="form-error" variant="ts">
						{errorMessage}
					</AppText>
				) : null}
			</View>
			<View className="gap-3">
				<AppButton disabled={disabled} fullWidth loading={loading} onPress={onPress} testID={submitTestID}>
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
