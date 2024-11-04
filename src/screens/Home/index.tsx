import { withProfiler } from '@sentry/react-native'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, ViewStyle } from 'react-native'
import { Bubble, BubbleProps, GiftedChat, IMessage } from 'react-native-gifted-chat'
import { Colors } from 'react-native-ui-lib'
import { hashStringToNumber } from 'react-native-ui-lib/src/helpers/AvatarHelper'
import { useChat } from '@app/hooks'

const getRightLeftStyle = (style1: ViewStyle, style2?: ViewStyle) => ({
	left: style1,
	right: style2 || style1,
})

const generateMessage = (
	text: string,
	options?: {
		id?: number
		createdAt?: number
		user?: number
	},
): IMessage => ({
	_id: options?.id || 1,
	text,
	createdAt: options?.createdAt || new Date(Date.now()),
	user: {
		_id: options?.user || 1,
	},
})

const Home = () => {
	const { mutate: postMessage, data: chatData } = useChat()
	const { t } = useTranslation('translation', { keyPrefix: 'modules.chat' })
	const [messages, setMessages] = useState<IMessage[]>([generateMessage(t('initialMessage'))])

	useEffect(() => {
		if (!chatData) {
			return
		}
		const messageId = hashStringToNumber(chatData.id)
		const chatResponse = generateMessage(chatData.choices[0].message.content, {
			id: messageId,
			createdAt: chatData.created * 1000,
		})

		setMessages(prev =>
			GiftedChat.append(
				prev.filter(e => e._id !== messageId),
				[chatResponse],
			),
		)
	}, [chatData])

	const onSend = useCallback(
		(data: IMessage[] = []) => {
			if (data.length > 0) {
				setMessages(previousMessages => GiftedChat.append(previousMessages, data))
				postMessage(data[0].text)
			}
		},
		[postMessage],
	)

	const renderBubble = useCallback(
		(props: BubbleProps<IMessage>) => (
			<Bubble
				{...props}
				containerStyle={getRightLeftStyle(styles.container)}
				wrapperStyle={getRightLeftStyle(styles.wrapper)}
			/>
		),
		[],
	)

	return (
		<GiftedChat
			messageContainerStyle={getRightLeftStyle(styles.messageContainer)}
			messages={messages}
			onSend={data => onSend(data)}
			renderBubble={renderBubble}
			showUserAvatar={false}
			user={{
				_id: 2,
			}}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		borderLeftWidth: 2,
		borderLeftColor: Colors.primary,
		alignItems: 'flex-start',
		marginLeft: 10,
		paddingLeft: 10,
	},
	wrapper: { alignItems: 'flex-start', marginRight: 0, marginLeft: 0 },
	messageContainer: { flexDirection: 'column', alignItems: 'flex-start', marginLeft: 0 },
})

export default withProfiler(Home)
