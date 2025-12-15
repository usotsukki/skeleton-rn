import { create } from 'zustand'
import { ChatMessage } from '@app/types/chat'

interface ChatState {
	messages: ChatMessage[]
	selectedMessages: Record<string, ChatMessage | null>
}

interface ChatStore extends ChatState {
	setMessages: (messages: ChatMessage[]) => void
	updateMessage: (id: string, text: string) => void
	clearMessages: () => void
	selectMessage: (message: ChatMessage) => void
	clearSelectedMessages: () => void
	isSelected: (id: string) => boolean
	someSelectedMessages: () => boolean
}

export const useChatStore = create<ChatStore>((set, get) => ({
	messages: [],
	selectedMessages: {},
	isSelected: (id: string) => !!get().selectedMessages[id],
	someSelectedMessages: () => Object.values(get().selectedMessages).some(message => message !== null),
	setMessages: messages => set({ messages }),
	updateMessage: (id, text) =>
		set(state => ({
			messages: state.messages.map(m => (m.id === id ? { ...m, text } : m)),
		})),
	clearMessages: () => set({ messages: [] }),
	selectMessage: (message: ChatMessage) =>
		set(state => ({
			selectedMessages: {
				...state.selectedMessages,
				[message.id]: state.selectedMessages[message.id] ? null : message,
			},
		})),
	clearSelectedMessages: () => set({ selectedMessages: {} }),
}))
