import dayjs from 'dayjs'
import { FlatList, Pressable, View } from 'react-native'
import { AppText } from '@app/components/shared'
import { useHaptics } from '@app/hooks'
import { useChatStore } from '@app/hooks/useChatStore'
import { ChatMessage } from '@app/types/chat'
import { cn } from '@app/utils'

type TimeWindowSeparatorProps = {
	message: ChatMessage
	previousMessage: ChatMessage | undefined
}

const TimeWindowSeparator = ({ message, previousMessage }: TimeWindowSeparatorProps): React.ReactNode => {
	const differenceInMinutes = dayjs(message.timestamp).diff(dayjs(previousMessage?.timestamp), 'minute')
	const differenceInDays = dayjs(message.timestamp).diff(dayjs(previousMessage?.timestamp), 'day')
	const shouldShowTimeWindowSeparator = differenceInMinutes > 30

	return shouldShowTimeWindowSeparator || !previousMessage ? (
		<AppText className="my-2 text-center text-xs">
			{dayjs(message.timestamp).format(differenceInDays > 0 || !previousMessage ? 'MMM DD -  HH:mm' : 'HH:mm')}
		</AppText>
	) : null
}

interface ChatMessageProps {
	message: ChatMessage
	onLongPress: (message: ChatMessage) => void
	messages: ChatMessage[]
}

const ChatMessageItem = ({ message, onLongPress, messages }: ChatMessageProps) => {
	const isUserMe = message.sender_id === 'user_me'
	const { triggerImpact } = useHaptics()
	const isSelected = useChatStore(state => state.isSelected(message.id))
	const selectMessage = useChatStore(state => state.selectMessage)
	const handleSelectMessage = () => {
		triggerImpact()
		selectMessage(message)
	}

	const previousMessage = messages[messages.findIndex(m => m.id === message.id) - 1]
	const nextMessage = messages[messages.findIndex(m => m.id === message.id) + 1]

	const isSameTimeWindowWithNext = dayjs(message?.timestamp).diff(dayjs(nextMessage?.timestamp), 'minute') < 10
	const isSameTimeWindowWithPrevious = dayjs(message?.timestamp).diff(dayjs(previousMessage?.timestamp), 'minute') < 10

	const handleLongPress = () => {
		triggerImpact()
		onLongPress(message)
	}

	return (
		<>
			<TimeWindowSeparator message={message} previousMessage={previousMessage} />
			<Pressable
				delayLongPress={400}
				onLongPress={handleLongPress}
				onPress={handleSelectMessage}
				style={({ pressed }) => ({
					opacity: pressed ? 0.7 : 1,
				})}>
				<View
					className={cn(
						'w-full justify-center px-4 py-1',
						isUserMe ? 'items-end' : 'items-start',
						isSameTimeWindowWithNext ? 'pb-1' : 'pb-2',
						isSameTimeWindowWithPrevious ? 'pt-1' : 'pt-2',
					)}>
					<View
						className={cn(
							'rounded-lg p-2 px-4',
							isUserMe ? 'bg-darkGrayBlue' : 'bg-primary',
							isSelected ? 'border border-4 border-selected' : '',
						)}>
						<AppText
							className={cn(
								'text-lg font-medium',
								'text-white',
								isUserMe ? 'text-end text-white' : 'text-start text-dark',
							)}>
							{message.text}
						</AppText>
					</View>
				</View>
			</Pressable>
		</>
	)
}

type ChatProps = {
	messages: ChatMessage[]
	onLongPress: (message: ChatMessage) => void
}

const Chat = ({ messages, onLongPress }: ChatProps) => {
	return (
		<FlatList
			className="w-full"
			data={messages}
			keyExtractor={item => item.id}
			ListHeaderComponent={() => (
				<View className="mb-4">
					<AppText className="text-center text-2xl font-bold">{'Chat Analysis'}</AppText>
					<AppText className="text-center text-sm text-gray-600">{'Press to select, long press to edit'}</AppText>
				</View>
			)}
			renderItem={({ item }) => <ChatMessageItem message={item} messages={messages} onLongPress={onLongPress} />}
			showsVerticalScrollIndicator={false}
		/>
	)
}

export default Chat
