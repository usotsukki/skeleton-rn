import 'react-native-gifted-chat'

declare module 'react-native-gifted-chat' {
	interface GiftedChatProps {
		renderTicks?: (message: IMessage) => React.ReactNode
	}
}
