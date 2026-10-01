let httpSeq = 0
const pathInvocationCounts = new Map<string, number>()

/**
 * Logs each outbound Supabase HTTP request (method, pathname, sequence #, per-path count).
 * Invoked from `global.fetch` in the Supabase client only for requests to the project URL.
 */
export function logSupabaseHttpRequest(method: string, requestUrl: string): void {
	if (!__DEV__) return
	let pathname: string
	try {
		pathname = new URL(requestUrl).pathname
	} catch {
		pathname = requestUrl
	}
	const upper = method.toUpperCase()
	httpSeq += 1
	const key = `${upper} ${pathname}`
	pathInvocationCounts.set(key, (pathInvocationCounts.get(key) ?? 0) + 1)
	const n = pathInvocationCounts.get(key)!
	console.log(`[API #${httpSeq}] ${upper} ${pathname} (×${n})`)
}
