import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	type BottomSheetModalProps,
} from '@gorhom/bottom-sheet'
import React, { type ReactNode, useCallback, useMemo } from 'react'
import { ActivityIndicator, Keyboard, Platform, StyleSheet, View } from 'react-native'
import { useThemeColors } from '@app/theme/colors'
import { ScreenHeader } from './ScreenHeader'

interface BottomModalProps {
	snapPoints: BottomSheetModalProps['snapPoints']
	title: string
	closeLabel: string
	onClose: () => void
	onDismiss?: () => void
	onAnimate?: (fromIndex: number, toIndex: number) => void
	isSubmitting?: boolean
	enablePanDownToClose?: boolean
	headerRight?: ReactNode
	children: ReactNode
}

export const BottomModal = React.forwardRef<BottomSheetModal, BottomModalProps>(function BottomModal(
	{
		snapPoints,
		title,
		closeLabel,
		onClose,
		onDismiss,
		onAnimate,
		isSubmitting = false,
		enablePanDownToClose = true,
		headerRight,
		children,
	},
	ref,
) {
	const c = useThemeColors()

	const styles = useMemo(
		() =>
			StyleSheet.create({
				card: {
					flex: 1,
					backgroundColor: c['bg-elevated'],
					borderTopLeftRadius: 24,
					borderTopRightRadius: 24,
					overflow: 'hidden',
				},
				overlay: {
					...StyleSheet.absoluteFillObject,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: c['bg-elevated'],
					opacity: 0.88,
				},
				handle: {
					alignSelf: 'center',
					marginTop: 8,
					height: 4,
					width: 40,
					borderRadius: 2,
					backgroundColor: c['border-strong'],
				},
			}),
		[c],
	)

	const sheetBg = useMemo(
		() => ({ backgroundColor: c['bg-elevated'], borderTopLeftRadius: 24, borderTopRightRadius: 24 }),
		[c],
	)

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				opacity={0.5}
				disappearsOnIndex={-1}
				pressBehavior={isSubmitting ? 'none' : 'close'}
			/>
		),
		[isSubmitting],
	)

	const handleAnimate = useCallback(
		(fromIndex: number, toIndex: number) => {
			if (toIndex === -1) Keyboard.dismiss()
			onAnimate?.(fromIndex, toIndex)
		},
		[onAnimate],
	)

	const handleCloseWithKeyboard = useCallback(() => {
		Keyboard.dismiss()
		onClose()
	}, [onClose])

	return (
		<BottomSheetModal
			accessible={Platform.select({ ios: false })}
			android_keyboardInputMode="adjustResize"
			backdropComponent={renderBackdrop}
			backgroundStyle={sheetBg}
			enableDynamicSizing={false}
			enablePanDownToClose={enablePanDownToClose}
			handleComponent={null}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
			onAnimate={handleAnimate}
			onDismiss={onDismiss}
			ref={ref}
			snapPoints={snapPoints}
			style={sheetBg}>
			<View style={styles.card}>
				<View style={styles.handle} />
				<ScreenHeader
					className="px-5 pb-2 pt-3"
					leading={{ kind: 'close-circle', onPress: handleCloseWithKeyboard, a11yLabel: closeLabel }}
					title={title}
					trailing={headerRight}
				/>

				<View className="flex-1">{children}</View>

				{isSubmitting ? (
					<View style={styles.overlay}>
						<ActivityIndicator color={c['accent']} size="large" />
					</View>
				) : null}
			</View>
		</BottomSheetModal>
	)
})
