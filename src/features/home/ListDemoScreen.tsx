import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { RepoError } from '@app/shared/api/db/errors'
import { useTabScreenInsets } from '@app/shared/hooks/useTabScreenInsets'
import { AppButton, AppText, CachedList } from '@app/shared/ui'

// Demo of every CachedList state with a fake query. Delete this screen (and its route and Home
// button) in a fork; real lists pass their `useQuery` result the same way.

const SCENARIOS = ['normal', 'failFirst', 'failRefresh', 'empty'] as const
type Scenario = (typeof SCENARIOS)[number]

const DELAY_MS = 1000
const ITEMS = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1), title: `Item ${i + 1}` }))
type Item = (typeof ITEMS)[number]

const wait = (ms: number) =>
	new Promise(resolve => {
		setTimeout(resolve, ms)
	})

export default function ListDemo() {
	const { t } = useTranslation()
	const { paddingTop, paddingBottom } = useTabScreenInsets()
	const [scenario, setScenario] = useState<Scenario>('normal')
	const calls = useRef<Record<Scenario, number>>({ normal: 0, failFirst: 0, failRefresh: 0, empty: 0 })

	const query = useQuery({
		queryKey: ['listDemo', scenario],
		queryFn: async (): Promise<Item[]> => {
			await wait(DELAY_MS)
			calls.current[scenario] += 1
			const call = calls.current[scenario]
			if (scenario === 'failFirst' && call === 1) throw new Error('fetch failed: demo network error')
			if (scenario === 'failRefresh' && call > 1) throw RepoError.Timeout('listDemo')
			return scenario === 'empty' ? [] : ITEMS
		},
		retry: false,
		staleTime: 0,
		meta: { persist: false },
	})

	return (
		<View className="flex-1 bg-bg" style={{ paddingTop }}>
			<View className="flex-row flex-wrap gap-2 px-4 pb-2 pt-3">
				{SCENARIOS.map(s => (
					<AppButton key={s} onPress={() => setScenario(s)} variant={s === scenario ? 'primary' : 'secondary'}>
						{t(`listDemo.${s}`)}
					</AppButton>
				))}
			</View>
			<CachedList
				contentContainerStyle={{ paddingBottom }}
				emptyTitle={t('listDemo.emptyTitle')}
				errorTitle={t('listDemo.errorTitle')}
				keyExtractor={item => item.id}
				query={query}
				renderItem={({ item }) => (
					<View className="mx-4 my-1 rounded-2xl bg-bg-elevated px-4 py-4">
						<AppText variant="tmed">{item.title}</AppText>
					</View>
				)}
			/>
		</View>
	)
}
