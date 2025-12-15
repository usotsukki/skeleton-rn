import { useEffect, useRef, useState } from 'react'
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, TextInput, View } from 'react-native'
import { Button, Colors } from 'react-native-ui-lib'
import { AppText } from '@app/components/shared'
import { useChatStore } from '@app/hooks/useChatStore'
import useChatTasks from '@app/hooks/useChatTasks'
import { ChatMessage } from '@app/types/chat'
import { cn } from '@app/utils'
import Chat from './Chat'

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

// const mockMessages: ChatMessage[] = [
// 	{
// 		id: '1',
// 		sender_id: 'user_me',
// 		text: 'Hello, how are you?',
// 		timestamp: '2025-01-06T10:15:00Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '2',
// 		sender_id: 'user_other',
// 		text: 'I am good, thank you! How can I help you today?',
// 		timestamp: '2025-01-06T10:16:30Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '3',
// 		sender_id: 'user_me',
// 		text: 'I need help with my account',
// 		timestamp: '2025-01-06T10:17:00Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '4',
// 		sender_id: 'user_other',
// 		text: 'Sure, I can help you with that. What seems to be the issue?',
// 		timestamp: '2025-01-06T10:18:45Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '5',
// 		sender_id: 'user_me',
// 		text: 'I cannot log in anymore',
// 		timestamp: '2025-01-06T10:55:00Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '6',
// 		sender_id: 'user_other',
// 		text: 'Have you tried resetting your password?',
// 		timestamp: '2025-01-07T10:56:20Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '7',
// 		sender_id: 'user_me',
// 		text: 'Yes, but it still does not work',
// 		timestamp: '2025-01-06T10:57:00Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '8',
// 		sender_id: 'user_other',
// 		text: 'Let me check your account status. One moment please.',
// 		timestamp: '2025-01-06T14:30:00Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '9',
// 		sender_id: 'user_me',
// 		text: 'Thank you!',
// 		timestamp: '2025-01-06T14:31:00Z',
// 		confidence: 0.95,
// 	},
// 	{
// 		id: '10',
// 		sender_id: 'user_other',
// 		text: 'You are welcome!',
// 		timestamp: '2025-01-06T14:32:00Z',
// 		confidence: 0.95,
// 	},
// ]

const ChatAnalysis = () => {
	const messages = useChatStore(state => state.messages)
	const someSelectedMessages = useChatStore(state => state.someSelectedMessages())
	const selectedMessages = useChatStore(state => state.selectedMessages)
	const updateMessage = useChatStore(state => state.updateMessage)
	const { mutate: analyzeChatTasks } = useChatTasks()
	const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
	const [isEditModalVisible, setIsEditModalVisible] = useState(false)

	const handleLongPress = (message: ChatMessage) => {
		setEditingMessage(message)
		setIsEditModalVisible(true)
	}

	const handleSaveMessage = (id: string, newText: string) => {
		updateMessage(id, newText)
	}

	const handleCloseModal = () => {
		setIsEditModalVisible(false)
		setEditingMessage(null)
	}

	const handleSubmit = () => {
		const selectedMessagesArray = Object.values(selectedMessages).filter(
			(message): message is ChatMessage => message !== null,
		)
		analyzeChatTasks(selectedMessagesArray)
	}

	return (
		<View className="flex-1 bg-cyan-950">
			<View
				className={cn(
					'flex-1 items-center justify-center',
					someSelectedMessages ? 'bg-blackTransparent6' : 'bg-lightGrayBlue',
				)}>
				<Chat messages={messages} onLongPress={handleLongPress} />
				<View className="h-20 w-full items-center justify-center">
					<Button
						bg-darkGrayBlue
						className="h-14 w-[80%] border-2 border-white"
						disabled={!someSelectedMessages}
						disabledBackgroundColor="#9ca3af"
						label={'Next step'}
						onPress={handleSubmit}
						tl
					/>
				</View>
			</View>

			<EditMessageModal
				message={editingMessage}
				onClose={handleCloseModal}
				onSave={handleSaveMessage}
				visible={isEditModalVisible}
			/>
		</View>
	)
}

export default ChatAnalysis
