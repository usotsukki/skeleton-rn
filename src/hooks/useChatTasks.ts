import { useMutation } from '@tanstack/react-query'
import { analyzeChatTasks } from '@app/api/chatTasks'
import { ChatMessage, ChatTasksAnalysisResponse } from '@app/types/chat'

const useChatTasks = () => {
	return useMutation<ChatTasksAnalysisResponse, Error, ChatMessage[]>({
		mutationFn: analyzeChatTasks,
		onSuccess: data => {
			console.log('data', data)
		},
		onError: error => {
			console.log('error', error)
		},
	})
}

export default useChatTasks
