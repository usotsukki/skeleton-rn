import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { AppleIcon, GoogleIcon, Spacer } from '@app/shared/svg'
import AppButton from './AppButton'
import AppText from './AppText'

interface AuthOAuthFooterProps {
	/** Omit to hide the Apple button (it only works on iOS). */
	onApple?: () => void
	/** Omit to hide the Google button (e.g. the build has no Google client id). */
	onGoogle?: () => void
	promptText: string
	actionLabel: string
	onAction: () => void
	actionTestID?: string
	/** Any auth request is running: provider buttons are disabled. */
	disabled?: boolean
	/** The provider whose request is running shows a spinner. */
	loadingProvider?: 'apple' | 'google'
}

export function AuthOAuthFooter({
	onApple,
	onGoogle,
	promptText,
	actionLabel,
	onAction,
	actionTestID,
	disabled,
	loadingProvider,
}: AuthOAuthFooterProps) {
	const { t } = useTranslation()
	const hasProvider = !!onApple || !!onGoogle
	return (
		<>
			{hasProvider ? <Spacer label={t('or').toUpperCase()} /> : null}
			<View className="gap-6">
				{hasProvider ? (
					<View className="flex-row items-center justify-center gap-3">
						{onApple ? (
							<AppButton
								accessibilityLabel={t('a11y.signInWithApple')}
								disabled={disabled && loadingProvider !== 'apple'}
								loading={loadingProvider === 'apple'}
								className="h-[50px] w-[64px] rounded-2xl border border-border bg-bg-elevated px-0"
								onPress={onApple}
								variant="secondary">
								<AppleIcon />
							</AppButton>
						) : null}
						{onGoogle ? (
							<AppButton
								accessibilityLabel={t('a11y.signInWithGoogle')}
								disabled={disabled && loadingProvider !== 'google'}
								loading={loadingProvider === 'google'}
								className="h-[50px] w-[64px] rounded-2xl border border-border bg-bg-elevated px-0"
								onPress={onGoogle}
								variant="secondary">
								<GoogleIcon />
							</AppButton>
						) : null}
					</View>
				) : null}
				<View className="flex-row items-center justify-center gap-1">
					<AppText className="text-text-secondary" variant="ts">
						{promptText}
					</AppText>
					<AppButton
						disabled={disabled}
						onPress={onAction}
						testID={actionTestID}
						textClassName="text-[14px]"
						variant="link">
						{actionLabel}
					</AppButton>
				</View>
			</View>
		</>
	)
}
