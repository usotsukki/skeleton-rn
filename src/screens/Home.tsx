import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView, View } from 'react-native'
import {
	AppButton,
	AppText,
	AuthEmailInput,
	AuthPasswordInput,
	Avatar,
	Card,
	CheckboxInput,
	Modal,
	SectionHeader,
	SwitchInput,
	TextField,
} from '@app/components/shared'
import { useAuthStore } from '@app/hooks/useAuth'
import useToast from '@app/hooks/useToast'

const SCROLL_STYLE = { paddingBottom: 48 } as const
const SHEET_SNAP: (string | number)[] = ['50%']

export default function Home() {
	const { t } = useTranslation()
	const user = useAuthStore(s => s.user)
	const showToast = useToast(s => s.showToast)
	const sheetRef = useRef<BottomSheetModal>(null)

	const displayName = user ? user.displayName : null
	const email = user ? user.email : null
	const heroLabel = displayName ?? email ?? t('homeScreen.defaultUser')
	const avatarLabel = displayName ?? email

	const [text, setText] = useState('')
	const [pw, setPw] = useState('')
	const [check, setCheck] = useState(false)
	const [toggle, setToggle] = useState(true)

	const fireAlert = () =>
		Alert.alert(t('homeScreen.alertTitle'), t('homeScreen.alertBody'), [
			{ text: t('modules.common.cancel'), style: 'cancel' },
			{ text: t('modules.common.done') },
		])

	return (
		<ScrollView className="flex-1 bg-bg-grouped" contentContainerStyle={SCROLL_STYLE}>
			<View className="px-4 pt-2">
				<Card className="bg-accent">
					<View className="flex-row items-center gap-4 p-5">
						<Avatar name={avatarLabel} />
						<View className="flex-1">
							<AppText className="text-text-on-accent" variant="ts">
								{t('homeScreen.greeting')}
							</AppText>
							<AppText className="text-text-on-accent" numberOfLines={1} variant="h2">
								{heroLabel}
							</AppText>
						</View>
					</View>
				</Card>
			</View>

			<SectionHeader title={t('homeScreen.buttons')} />
			<View className="gap-3 px-4">
				<AppButton fullWidth onPress={() => undefined}>
					{t('homeScreen.primary')}
				</AppButton>
				<AppButton fullWidth onPress={() => undefined} variant="secondary">
					{t('homeScreen.secondary')}
				</AppButton>
				<View className="flex-row gap-3">
					<AppButton className="flex-1" onPress={() => undefined} variant="ghost">
						{t('homeScreen.ghost')}
					</AppButton>
					<AppButton className="flex-1" onPress={() => undefined} variant="destructive">
						{t('homeScreen.destructive')}
					</AppButton>
				</View>
				<AppButton onPress={() => undefined} variant="link">
					{t('homeScreen.link')}
				</AppButton>
			</View>

			<SectionHeader title={t('homeScreen.inputs')} />
			<View className="gap-4 px-4">
				<TextField label={t('homeScreen.textField')} onChangeText={setText} placeholder="Type here…" value={text} />
				<AuthEmailInput label={t('modules.auth.email')} onChangeText={setText} value={text} />
				<AuthPasswordInput label={t('modules.auth.password')} onChangeText={setPw} value={pw} />
				<View className="flex-row items-center justify-between pt-1">
					<CheckboxInput label={t('homeScreen.checkbox')} onValueChange={setCheck} value={check} />
					<SwitchInput label="" onValueChange={setToggle} value={toggle} />
				</View>
			</View>

			<SectionHeader title={t('homeScreen.triggers')} />
			<View className="gap-3 px-4">
				<AppButton fullWidth onPress={() => showToast(t('homeScreen.toastSuccess'), 'success')}>
					{t('homeScreen.fireToastSuccess')}
				</AppButton>
				<AppButton fullWidth onPress={() => showToast(t('homeScreen.toastError'), 'error')} variant="destructive">
					{t('homeScreen.fireToastError')}
				</AppButton>
				<AppButton fullWidth onPress={fireAlert} variant="secondary">
					{t('homeScreen.fireAlert')}
				</AppButton>
				<AppButton fullWidth onPress={() => sheetRef.current?.present()} variant="secondary">
					{t('homeScreen.openSheet')}
				</AppButton>
			</View>

			<Modal
				closeLabel={t('modules.common.close')}
				onClose={() => sheetRef.current?.dismiss()}
				ref={sheetRef}
				snapPoints={SHEET_SNAP}
				title={t('homeScreen.sheetTitle')}>
				<View className="gap-3 px-5 py-4">
					<AppText className="text-text-secondary" variant="tm">
						{t('homeScreen.sheetBody')}
					</AppText>
					<AppButton fullWidth onPress={() => sheetRef.current?.dismiss()}>
						{t('modules.common.done')}
					</AppButton>
				</View>
			</Modal>
		</ScrollView>
	)
}
