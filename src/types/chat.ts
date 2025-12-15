export type ChatMessage = {
	id: string
	sender_id: string
	text: string
	timestamp: string
	confidence: number
}

// Task extraction types
export type TaskType = 'action' | 'reminder' | 'deadline' | 'question' | 'decision' | 'follow_up'
export type CriticalityLevel = 'low' | 'medium' | 'high' | 'urgent'
export type TimeWindow = 'immediate' | 'today' | 'this_week' | 'flexible' | 'unknown'

export type ExtractedTask = {
	type: TaskType
	name: string
	description: string
	duration_minutes?: number
	time_window: TimeWindow
	source_message_id: string
	priority: number // 1-5, 5 being highest
}

export type ChatTasksAnalysisResponse = {
	suggested_response?: string
	summary?: string
	criticality: CriticalityLevel
	requires_manual_attention: boolean
	attention_reason?: string
	tasks: ExtractedTask[]
}

export type ChatTasksRequest = {
	messages: ChatMessage[]
	user_id?: string
}
