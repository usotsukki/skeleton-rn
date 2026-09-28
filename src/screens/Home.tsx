import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
	AppButton,
	AppText,
	AuthEmailInput,
	AuthPasswordInput,
	Avatar,
	BottomModal,
	BottomSheetKeyboardAwareScrollView,
	Card,
	CheckboxInput,
	KeyboardScrollView,
	SectionHeader,
	SwitchInput,
	TextField,
} from '@app/components/shared'
import useAlert from '@app/hooks/useAlert'
import { useAndroidStableTabBar } from '@app/hooks/useAndroidStableTabBar'
import { useAuthStore } from '@app/hooks/useAuth'
import { useTabScreenInsets } from '@app/hooks/useTabScreenInsets'
import useToast from '@app/hooks/useToast'
import { showDeleteConfirmation } from '@app/utils/alerts'

const SHEET_SNAP: (string | number)[] = ['50%']
// Demo only: stands in for an async delete request.
const DEMO_DELETE_MS = 600
const wait = (ms: number) =>
	new Promise(resolve => {
		setTimeout(resolve, ms)
	})
const FORM_SHEET_SNAP: (string | number)[] = ['60%']

export default function Home() {
	const { t } = useTranslation()
	const router = useRouter()
	const { paddingTop, paddingBottom } = useTabScreenInsets()
	const user = useAuthStore(s => s.user)
	const showToast = useToast(s => s.showToast)
	const sheetRef = useRef<BottomSheetModal>(null)
	const formSheetRef = useRef<BottomSheetModal>(null)

	useAndroidStableTabBar()

	const displayName = user?.displayName ?? null
	const email = user?.email ?? null
	const heroLabel = displayName ?? email ?? t('homeScreen.defaultUser')
	const avatarLabel = displayName ?? email

	const [textValue, setTextValue] = useState('')
	const [emailValue, setEmailValue] = useState('')
	const [pwValue, setPwValue] = useState('')
	const [check, setCheck] = useState(false)
	const [toggle, setToggle] = useState(true)

	const [formText, setFormText] = useState('')
	const [formEmail, setFormEmail] = useState('')
	const [formPassword, setFormPassword] = useState('')

	const onFormSubmit = () => {
		formSheetRef.current?.dismiss()
		showToast(t('homeScreen.formSheetSubmitted'), 'success')
		setFormText('')
		setFormEmail('')
		setFormPassword('')
	}

	return (
		<View style={{ flex: 1 }} testID="home-screen">
			<KeyboardScrollView className="bg-bg-grouped" contentContainerStyle={{ paddingTop, paddingBottom }}>
				<View className="px-4 pt-2">
					<Card className="bg-bg-elevated">
						<View className="flex-row items-center gap-4 p-5">
							<Avatar name={avatarLabel} />
							<View className="flex-1">
								<AppText className="text-text" numberOfLines={1} variant="h3">
									{heroLabel}
								</AppText>
								{email ? (
									<AppText className="text-text-muted" numberOfLines={1} variant="cap">
										{email}
									</AppText>
								) : null}
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
					<TextField
						label={t('homeScreen.textField')}
						onChangeText={setTextValue}
						placeholder={t('homeScreen.textFieldPlaceholder')}
						value={textValue}
					/>
					<AuthEmailInput
						label={t('modules.auth.email')}
						onChangeText={setEmailValue}
						placeholder={t('homeScreen.emailPlaceholder')}
						value={emailValue}
					/>
					<AuthPasswordInput
						label={t('modules.auth.password')}
						onChangeText={setPwValue}
						placeholder={t('homeScreen.passwordPlaceholder')}
						value={pwValue}
					/>
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
					<AppButton fullWidth onPress={() => sheetRef.current?.present()} variant="secondary">
						{t('homeScreen.openSheet')}
					</AppButton>
					<AppButton fullWidth onPress={() => formSheetRef.current?.present()} variant="secondary">
						{t('homeScreen.openFormSheet')}
					</AppButton>
					<AppButton fullWidth onPress={() => router.push('/Home/ListDemo')} variant="secondary">
						{t('listDemo.open')}
					</AppButton>
					<AppButton
						fullWidth
						onPress={() =>
							useAlert
								.getState()
								.showAlert({ title: t('homeScreen.alertTitle'), description: t('homeScreen.alertBody') })
						}
						variant="secondary">
						{t('homeScreen.showAlert')}
					</AppButton>
					<AppButton
						fullWidth
						onPress={() =>
							showDeleteConfirmation({
								title: t('homeScreen.deleteTitle'),
								name: t('homeScreen.demoItemName'),
								onConfirm: () => wait(DEMO_DELETE_MS),
								onSuccess: () => showToast(t('homeScreen.deleted'), 'success'),
							})
						}
						variant="destructive">
						{t('homeScreen.confirmDelete')}
					</AppButton>
				</View>
			</KeyboardScrollView>

			<BottomModal
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
			</BottomModal>

			<BottomModal
				closeLabel={t('modules.common.close')}
				onClose={() => formSheetRef.current?.dismiss()}
				ref={formSheetRef}
				snapPoints={FORM_SHEET_SNAP}
				title={t('homeScreen.formSheetTitle')}>
				<BottomSheetKeyboardAwareScrollView contentContainerStyle={{ paddingTop: 16 }}>
					<View className="gap-4">
						<TextField
							label={t('homeScreen.textField')}
							onChangeText={setFormText}
							placeholder={t('homeScreen.textFieldPlaceholder')}
							value={formText}
						/>
						<AuthEmailInput
							label={t('modules.auth.email')}
							onChangeText={setFormEmail}
							placeholder={t('homeScreen.emailPlaceholder')}
							value={formEmail}
						/>
						<AuthPasswordInput
							label={t('modules.auth.password')}
							onChangeText={setFormPassword}
							placeholder={t('homeScreen.passwordPlaceholder')}
							value={formPassword}
						/>
					</View>
					<View className="mt-auto pt-6">
						<AppButton disabled={!formText || !formEmail || !formPassword} fullWidth onPress={onFormSubmit}>
							{t('homeScreen.formSheetSubmit')}
						</AppButton>
					</View>
				</BottomSheetKeyboardAwareScrollView>
			</BottomModal>
		</View>
	)
}
