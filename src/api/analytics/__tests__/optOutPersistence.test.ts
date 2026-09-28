/**
 * Against the real SDK (the global mock is bypassed): the opt-out must survive `resetAnalytics`'s
 * keep-list, and the SDK default reset would lose it.
 */
const { PostHog, PostHogPersistedProperty } =
	jest.requireActual<typeof import('posthog-react-native')>('posthog-react-native')

const KEEP = [
	PostHogPersistedProperty.OptedOut,
	PostHogPersistedProperty.InstalledAppBuild,
	PostHogPersistedProperty.InstalledAppVersion,
	PostHogPersistedProperty.DeviceId,
]

function memoryStorage() {
	const data = new Map<string, string>()
	return {
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => {
			data.set(key, value)
		},
	}
}

const clients: InstanceType<typeof PostHog>[] = []

afterEach(async () => {
	await Promise.all(clients.splice(0).map(ph => ph.shutdown()))
	// The rejected flags request settles asynchronously; let it finish before Jest tears down.
	await new Promise(resolve => {
		setTimeout(resolve, 50)
	})
})

async function client(storage: ReturnType<typeof memoryStorage>) {
	const ph = new PostHog('phc_test', {
		customStorage: storage,
		preloadFeatureFlags: false,
		captureAppLifecycleEvents: false,
		disableRemoteConfig: true,
		flushAt: 1000,
		fetchRetryCount: 0,
	})
	clients.push(ph)
	await ph.ready()
	return ph
}

describe('PostHog opt-out persistence', () => {
	beforeEach(() => {
		// reset() reloads flags: answer at once so no request is still in flight at teardown.
		jest.mocked(fetch).mockImplementation(() => Promise.resolve(new Response('{"featureFlags":{}}', { status: 200 })))
	})

	it('stays opted out after resetAnalytics-style reset and a relaunch', async () => {
		const storage = memoryStorage()
		const first = await client(storage)
		await first.optOut()
		first.reset(KEEP)

		const relaunched = await client(storage)
		expect(relaunched.optedOut).toBe(true)
	})

	it('loses the opt-out with the SDK default reset (why the keep-list exists)', async () => {
		const storage = memoryStorage()
		const first = await client(storage)
		await first.optOut()
		first.reset()

		const relaunched = await client(storage)
		expect(relaunched.optedOut).toBe(false)
	})
})
