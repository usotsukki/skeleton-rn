import { GoogleGenerativeAI, Part, Schema, SchemaType } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
	throw new Error('GEMINI_API_KEY environment variable is not set')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

type OcrRequest = {
	image: string // base64 encoded image
	mimeType?: string // e.g. 'image/jpeg', 'image/png'
}

export type ChatMessage = {
	id: string
	sender_id: string
	text: string
	timestamp: string
	confidence: number
}

type OcrResponse = {
	messages: ChatMessage[]
}

const messageSchema: Schema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			id: { type: SchemaType.STRING, description: 'Unique message ID (e.g. msg_001, msg_002)' },
			sender_id: {
				type: SchemaType.STRING,
				description:
					'Sender identifier. Use "user_me" for messages sent by the phone owner (usually on the right side or with checkmarks), use "user_other" for the other person',
			},
			text: { type: SchemaType.STRING, description: 'The message text content' },
			timestamp: {
				type: SchemaType.STRING,
				description:
					'ISO 8601 timestamp. Use today\'s date if only time is shown (e.g. "7:23 PM" becomes "2025-01-06T19:23:00Z")',
			},
			confidence: {
				type: SchemaType.NUMBER,
				description: 'Confidence score between 0 and 1 for how accurately the text was extracted',
			},
		},
		required: ['id', 'sender_id', 'text', 'timestamp', 'confidence'],
	},
}

const PROMPT = `You are analyzing a chat screenshot. Extract all messages and return them as a JSON array.

Rules:
1. Each message should have: id, sender_id, text, timestamp, confidence
2. For sender_id: use "user_me" for messages from the phone owner (typically right-aligned, may have read receipts/checkmarks like ✓✓), use "user_other" for the other person (typically left-aligned)
3. Generate sequential IDs like "msg_001", "msg_002", etc.
4. Convert visible times to ISO 8601 format using today's date (2025-01-06)
5. Set confidence based on text clarity (0.9-0.99 for clear text, lower for unclear)
6. Preserve the exact message text as shown
7. Messages should be in chronological order

Return ONLY the JSON array, no additional text.`

export async function POST(request: Request): Promise<Response> {
	try {
		const body: OcrRequest = await request.json()

		if (!body.image) {
			return Response.json({ error: 'Image is required' }, { status: 400 })
		}

		const model = genAI.getGenerativeModel({
			model: 'gemini-2.0-flash',
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: messageSchema,
			},
		})

		const imagePart: Part = {
			inlineData: {
				mimeType: body.mimeType ?? 'image/jpeg',
				data: body.image,
			},
		}

		const result = await model.generateContent([PROMPT, imagePart])

		const response = result.response
		const text = response.text()
		const messages: ChatMessage[] = JSON.parse(text)

		return Response.json({ messages } satisfies OcrResponse)
	} catch (error) {
		console.error('OCR API error:', error)
		const message = error instanceof Error ? error.message : 'Unknown error'
		return Response.json({ error: message }, { status: 500 })
	}
}
