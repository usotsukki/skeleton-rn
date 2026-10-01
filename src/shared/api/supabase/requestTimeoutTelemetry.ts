import NetInfo from '@react-native-community/netinfo'
import * as Sentry from '@sentry/react-native'
import { Platform } from 'react-native'
import type { RequestTimeoutInfo } from './fetchWithTimeout'

/** Sentry tag values are capped at 200 chars; storage object paths can be long. */
const PATH_TAG_MAX_LENGTH = 120

const reportedPaths = new Set<string>()

/**
 * Field signal for hung requests. A breadcrumb on every timeout keeps the
 * sequence visible on whatever error follows; one `request-timeout` message
 * per path per app session (the slow-query watchdog's guard) gives a per
 * platform / per network-type count without a retry storm inflating it.
 * The NetInfo read is async and best-effort: the message still goes out when
 * the connection type cannot be resolved.
 */
export function reportRequestTimeout(info: RequestTimeoutInfo): void {
	const path = info.pathname.slice(0, PATH_TAG_MAX_LENGTH)
	Sentry.addBreadcrumb({
		category: 'network',
		level: 'warning',
		message: 'request-timeout',
		data: { method: info.method, path, timeoutMs: info.timeoutMs, platform: Platform.OS },
	})

	if (reportedPaths.has(path)) return
	reportedPaths.add(path)

	NetInfo.fetch()
		.then(
			state => state.type,
			() => 'unknown',
		)
		.then(connectionType => {
			Sentry.captureMessage('request-timeout', {
				level: 'warning',
				tags: {
					'request.method': info.method,
					'request.path': path,
					'network.type': connectionType,
				},
				extra: { timeoutMs: info.timeoutMs },
			})
		})
}

export function __resetRequestTimeoutTelemetryForTests(): void {
	reportedPaths.clear()
}
