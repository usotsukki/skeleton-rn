import axios from 'axios'

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY
const baseURL = process.env.OPEN_AI_API_URL

const chatClient = axios.create({
	baseURL,
	headers: {
		'Authorization': `Bearer ${OPEN_AI_API_KEY}`,
		'Content-Type': 'application/json',
	},
})

const createErrorResponse = (message: string, status: number) =>
	new Response(message, {
		status,
		statusText: message,
		headers: {
			'Content-Type': 'text/plain',
		},
	})

const formatRequestPayload = (message: string) => ({
	model: 'gpt-4o-mini',
	messages: [
		{ role: 'system', content: 'You must give one mean one line roasts to every user message' },
		{ role: 'user', content: message },
	],
})

export const POST = async (req: Request): Promise<Response> => {
	try {
		const body = await req.json()
		const { message } = body

		if (!message) {
			return createErrorResponse('Must provide a message', 400)
		}

		const response = await chatClient.post('chat/completions', formatRequestPayload(message))

		if (!response.data) {
			throw new Error('Error calling OpenAI API')
		}

		return new Response(JSON.stringify(response.data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		})
	} catch (error) {
		console.error('Error in POST handler:', error)
		return createErrorResponse('Internal server error', 500)
	}
}
