import { View } from 'react-native'
import { AppleIcon, GoogleIcon, Spacer } from '@app/components/svg'
import AppButton from './AppButton'
import AppText from './AppText'

interface AuthOAuthFooterProps {
	onApple: () => void
	onGoogle: () => void
	promptText: string
	actionLabel: string
	onAction: () => void
	actionTestID?: string
}

export function AuthOAuthFooter({
	onApple,
	onGoogle,
	promptText,
	actionLabel,
	onAction,
	actionTestID,
}: AuthOAuthFooterProps) {
	return (
		<>
			<Spacer label="OR" />
			<View className="gap-6">
				<View className="flex-row items-center justify-center gap-3">
					<AppButton
						className="h-[50px] w-[64px] rounded-2xl border border-border bg-bg-elevated px-0"
						onPress={onApple}
						variant="secondary">
						<AppleIcon />
					</AppButton>
					<AppButton
						className="h-[50px] w-[64px] rounded-2xl border border-border bg-bg-elevated px-0"
						onPress={onGoogle}
						variant="secondary">
						<GoogleIcon />
					</AppButton>
				</View>
				<View className="flex-row items-center justify-center gap-1">
					<AppText className="text-text-secondary" variant="ts">
						{promptText}
					</AppText>
					<AppButton onPress={onAction} testID={actionTestID} textClassName="text-[14px]" variant="link">
						{actionLabel}
					</AppButton>
				</View>
			</View>
		</>
	)
}
