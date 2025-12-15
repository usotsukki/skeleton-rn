import { ChatMessage, ChatTasksAnalysisResponse, ChatTasksRequest } from '@app/types/chat'
import apiClient from './client'

export const analyzeChatTasks = async (
	messages: ChatMessage[],
	userId?: string,
): Promise<ChatTasksAnalysisResponse> => {
	const payload: ChatTasksRequest = {
		messages,
		user_id: userId,
	}
	const res = await apiClient.post<ChatTasksAnalysisResponse>('chat-tasks', payload)
	return res.data
}
