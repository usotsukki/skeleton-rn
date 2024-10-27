import apiClient from './client'

interface Message {
	role: string
	content: string
}

interface Choice {
	index: number
	message: Message
	logprobs: null
	finish_reason: string
}

interface ChatCompletionResponse {
	id: string
	object: string
	created: number
	model: string
	system_fingerprint: string
	choices: Choice[]
	usage: Usage
}

interface Usage {
	prompt_tokens: number
	completion_tokens: number
	total_tokens: number
	completion_tokens_details: {
		reasoning_tokens: number
	}
}

export const fetchChatCompletion = async ({ message }: { message: string }): Promise<ChatCompletionResponse> => {
	const res = await apiClient.post('chat', { message })
	return res.data
}
