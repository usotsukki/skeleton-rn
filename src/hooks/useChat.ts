import { useMutation } from '@tanstack/react-query'
import { fetchChatCompletion } from '@app/api/chat'

const useChats = () => {
	return useMutation({
		mutationFn: async (userMessage: string) =>
			fetchChatCompletion({
				message: userMessage,
			}),
	})
}

export default useChats
