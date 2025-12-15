import { useEffect, useRef, useState } from 'react'
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { ChatMessage } from '@app/api/ocr'
import { AppText } from '@app/components/shared'
import { cn } from '@app/utils'

type EditMessageModalProps = {
	visible: boolean
	message: ChatMessage | null
	onSave: (id: string, newText: string) => void
	onClose: () => void
}

const EditMessageModal = ({ visible, message, onSave, onClose }: EditMessageModalProps) => {
	const inputRef = useRef<TextInput>(null)
	const [editedText, setEditedText] = useState('')
	const originalText = useRef('')

	useEffect(() => {
		if (visible && message) {
			setEditedText(message.text)
			originalText.current = message.text
			setTimeout(() => inputRef.current?.focus(), 100)
		}
	}, [visible, message])

	const hasChanges = editedText !== originalText.current

	const handleSave = () => {
		if (message && editedText.trim()) {
			onSave(message.id, editedText.trim())
			onClose()
		}
	}

	const handleClose = () => {
		Keyboard.dismiss()
		if (hasChanges) {
			Alert.alert('Discard changes?', 'You have unsaved changes. Are you sure you want to discard them?', [
				{ text: 'Keep editing', style: 'cancel' },
				{ text: 'Discard', style: 'destructive', onPress: onClose },
			])
		} else {
			onClose()
		}
	}

	if (!message) return null

	return (
		<Modal animationType="fade" onRequestClose={handleClose} transparent visible={visible}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 items-center justify-center px-6"
				keyboardVerticalOffset={0}>
				{/* Backdrop */}
				<Pressable className="absolute inset-0 bg-black/50" onPress={handleClose} />

				{/* Floating card */}
				<View className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
					{/* Header */}
					<View className="border-b border-gray-100 bg-gray-50 px-5 py-4">
						<View className="flex-row items-center justify-between">
							<AppText className="text-xl font-bold text-dark">{'Edit message'}</AppText>
							<Pressable
								className="h-8 w-8 items-center justify-center rounded-full bg-gray-200"
								hitSlop={8}
								onPress={handleClose}>
								<AppText className="text-lg text-gray-500">{'✕'}</AppText>
							</Pressable>
						</View>
						<AppText className="mt-1 text-sm text-gray-500">{'Make changes to this message'}</AppText>
					</View>

					{/* Input */}
					<View className="p-5">
						<TextInput
							autoCapitalize="sentences"
							autoCorrect
							className="min-h-[120] rounded-xl border border-gray-200 bg-white p-4 text-base text-dark"
							multiline
							onChangeText={setEditedText}
							placeholder="Enter message..."
							placeholderTextColor={Colors.grey40}
							ref={inputRef}
							style={{ textAlignVertical: 'top' }}
							value={editedText}
						/>
					</View>

					{/* Actions */}
					<View className="flex-row gap-3 border-t border-gray-100 bg-gray-50 p-4">
						<Pressable
							className="flex-1 items-center rounded-xl border border-gray-300 bg-white py-3"
							onPress={handleClose}>
							<AppText className="font-semibold text-gray-600">{'Cancel'}</AppText>
						</Pressable>
						<Pressable
							className={cn(
								'flex-1 items-center rounded-xl py-3',
								editedText.trim() && hasChanges ? 'bg-primary' : 'bg-gray-200',
							)}
							disabled={!editedText.trim() || !hasChanges}
							onPress={handleSave}>
							<AppText
								className={cn('font-semibold', editedText.trim() && hasChanges ? 'text-white' : 'text-gray-400')}>
								{'Save'}
							</AppText>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	)
}

export default EditMessageModal
