import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'
import { ChatTasksAnalysisResponse, ChatTasksRequest } from '@app/types/chat'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
	throw new Error('GEMINI_API_KEY environment variable is not set')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const responseSchema: Schema = {
	type: SchemaType.OBJECT,
	properties: {
		suggested_response: {
			type: SchemaType.STRING,
			description:
				'A suggested response message the user can copy and send. Should be natural and contextually appropriate.',
			nullable: true,
		},
		summary: {
			type: SchemaType.STRING,
			description:
				'A brief summary of the conversation if it contains more than 5 messages or significant content. Null if the conversation is short and simple.',
			nullable: true,
		},
		criticality: {
			type: SchemaType.STRING,
			format: 'enum',
			enum: ['low', 'medium', 'high', 'urgent'],
			description:
				'Overall criticality level of the conversation. urgent = needs immediate action, high = important matters requiring prompt attention, medium = regular tasks/requests, low = casual conversation',
		},
		requires_manual_attention: {
			type: SchemaType.BOOLEAN,
			description:
				'Whether the conversation requires manual review due to sensitive content, complex decisions, emotional situations, or ambiguous requests that AI cannot handle appropriately.',
		},
		attention_reason: {
			type: SchemaType.STRING,
			description: 'If requires_manual_attention is true, explains why manual attention is needed.',
			nullable: true,
		},
		tasks: {
			type: SchemaType.ARRAY,
			description: 'List of extracted tasks, action items, or matters requiring attention.',
			items: {
				type: SchemaType.OBJECT,
				properties: {
					type: {
						type: SchemaType.STRING,
						format: 'enum',
						enum: ['action', 'reminder', 'deadline', 'question', 'decision', 'follow_up'],
						description:
							'Type of task: action = something to do, reminder = something to remember, deadline = time-sensitive matter, question = needs an answer, decision = requires a choice, follow_up = needs checking back',
					},
					name: {
						type: SchemaType.STRING,
						description: 'Short, actionable name for the task (max 50 chars)',
					},
					description: {
						type: SchemaType.STRING,
						description: 'Detailed description of what needs to be done',
					},
					duration_minutes: {
						type: SchemaType.NUMBER,
						description: 'Estimated duration in minutes to complete the task. Null if unknown.',
						nullable: true,
					},
					time_window: {
						type: SchemaType.STRING,
						format: 'enum',
						enum: ['immediate', 'today', 'this_week', 'flexible', 'unknown'],
						description:
							'When the task should be completed: immediate = ASAP, today = by end of day, this_week = within the week, flexible = no specific time constraint, unknown = cannot determine',
					},
					source_message_id: {
						type: SchemaType.STRING,
						description: 'ID of the message that this task was extracted from',
					},
					priority: {
						type: SchemaType.NUMBER,
						description: 'Priority level from 1-5, where 5 is highest priority',
					},
				},
				required: ['type', 'name', 'description', 'time_window', 'source_message_id', 'priority'],
			},
		},
	},
	required: ['criticality', 'requires_manual_attention', 'tasks'],
}

const systemPrompt = `You are a productivity assistant that analyzes chat conversations to extract actionable tasks and provide helpful summaries.

Your job is to:
1. Identify any tasks, requests, deadlines, questions that need answers, or matters requiring attention from the conversation.
2. Determine the overall criticality of the conversation.
3. Suggest a natural response the user could send.
4. Provide a summary if the conversation is substantial.
5. Flag if the conversation requires manual attention (sensitive topics, complex emotions, important decisions, ambiguous situations).

Guidelines for task extraction:
- Look for explicit requests: "Can you...", "Please...", "I need you to..."
- Look for implicit tasks: "It would be nice if...", "The deadline is...", "Don't forget to..."
- Look for deadlines: "by EOD", "by tomorrow", "when you get here", "ASAP"
- Look for questions that need answers
- Look for decisions that need to be made
- Look for follow-ups: "Let me know...", "Keep me posted...", "Update me on..."

Guidelines for criticality:
- urgent: Immediate action required, time-sensitive, emergencies
- high: Important matters, near deadlines, significant requests
- medium: Regular tasks, normal requests, routine follow-ups
- low: Casual conversation, no action needed, social chat

Guidelines for manual attention flag:
- Set to true for: emotional conversations, relationship issues, conflicts, sensitive personal matters, complex business decisions, ambiguous requests that could be misinterpreted, anything where an automated response could be inappropriate.

Guidelines for suggested response:
- Keep it natural and conversational
- Match the tone of the conversation
- Be helpful but not over-promising
- If tasks were identified, acknowledge them
- If emotional content, be empathetic but suggest the user review manually

The user_me sender_id indicates messages from the person using this app (your user).
The user_other sender_id indicates messages from the other party in the conversation.
Focus primarily on tasks/requests from user_other that user_me needs to handle.`

export async function POST(request: Request) {
	try {
		const body: ChatTasksRequest = await request.json()
		const { messages, user_id = 'user_me' } = body

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return Response.json({ error: 'Messages array is required and cannot be empty' }, { status: 400 })
		}

		const model = genAI.getGenerativeModel({
			model: 'gemini-2.5-pro',
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: responseSchema,
				temperature: 0.3, // Lower temperature for more consistent task extraction
			},
		})

		// Format messages for the prompt
		const formattedMessages = messages
			.map(msg => {
				const sender = msg.sender_id === user_id ? 'user_me' : 'user_other'
				const time = new Date(msg.timestamp).toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
				})
				return `[${time}] ${sender} (msg_id: ${msg.id}): ${msg.text}`
			})
			.join('\n')

		const userPrompt = `Analyze the following chat conversation and extract any tasks, action items, or matters requiring attention.

Conversation:
${formattedMessages}

Respond with the analysis in the specified JSON format.`

		const result = await model.generateContent([{ text: systemPrompt }, { text: userPrompt }])

		const response = result.response
		const text = response.text()

		try {
			const analysisResult: ChatTasksAnalysisResponse = JSON.parse(text)
			return Response.json(analysisResult)
		} catch (parseError) {
			console.error('Failed to parse Gemini response:', parseError)
			return Response.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 })
		}
	} catch (error) {
		console.error('Chat tasks analysis error:', error)
		return Response.json({ error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 })
	}
}
