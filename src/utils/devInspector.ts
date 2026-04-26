import { useSyncExternalStore } from 'react'

/** Set true to record MMKV / auth storage / Supabase session adapter reads in the dev inspector. */
export const DEV_INSPECTOR_LOG_LOCAL_CACHE = false

export type DevInspectorChannel = 'local-cache' | 'state'

export interface DevInspectorEntry {
	id: number
	channel: DevInspectorChannel
	message: string
	payload: string
	createdAt: string
}

const MAX_DEV_INSPECTOR_ENTRIES = 200

let nextEntryId = 0
let entries: DevInspectorEntry[] = []
const listeners = new Set<() => void>()

function notifyListeners() {
	listeners.forEach(listener => listener())
}

function serializePayload(payload?: unknown): string {
	if (payload === undefined) return ''
	if (typeof payload === 'string') return payload
	try {
		return JSON.stringify(payload)
	} catch {
		return String(payload)
	}
}

export function logDevInspectorEvent(channel: DevInspectorChannel, message: string, payload?: unknown): void {
	if (!__DEV__) return
	if (channel === 'local-cache' && !DEV_INSPECTOR_LOG_LOCAL_CACHE) return
	nextEntryId += 1
	entries = [
		{
			id: nextEntryId,
			channel,
			message,
			payload: serializePayload(payload),
			createdAt: new Date().toISOString(),
		},
		...entries,
	].slice(0, MAX_DEV_INSPECTOR_ENTRIES)
	notifyListeners()
}

export function clearDevInspectorEntries(): void {
	entries = []
	notifyListeners()
}

export function subscribeDevInspector(listener: () => void): () => void {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

export function getDevInspectorEntries(channel?: DevInspectorChannel): DevInspectorEntry[] {
	return channel ? entries.filter(entry => entry.channel === channel) : entries
}

export function useDevInspectorEntries(channel?: DevInspectorChannel): DevInspectorEntry[] {
	return useSyncExternalStore(
		subscribeDevInspector,
		() => getDevInspectorEntries(channel),
		() => getDevInspectorEntries(channel),
	)
}
