import { ChatMessage } from '@app/types/chat'
import apiClient from './client'

type OcrResponse = {
	messages: ChatMessage[]
}

export const getMessagesFromImage = async (image: string, mimeType?: string): Promise<ChatMessage[]> => {
	const res = await apiClient.post<OcrResponse>('ocr', { image, mimeType })
	return res.data.messages
}
