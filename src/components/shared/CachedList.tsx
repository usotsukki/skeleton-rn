import { FlashList, type FlashListProps } from '@shopify/flash-list'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { usePullToRefresh } from '@app/hooks/usePullToRefresh'
import { requestErrorMessage } from '@app/utils/requestErrorMessage'
import AppText from './AppText'
import { ScreenState } from './ScreenState'
import SkeletonPulse from './SkeletonPulse'

const SKELETON_ROWS = 6

export type CachedListQuery<T> = Pick<UseQueryResult<T[]>, 'data' | 'error' | 'isError' | 'refetch' | 'fetchStatus'>

export interface CachedListProps<T>
	extends Omit<FlashListProps<T>, 'data' | 'refreshing' | 'onRefresh' | 'ListEmptyComponent' | 'ListHeaderComponent'> {
	/** The `useQuery` result (or the fields below from it). */
	query: CachedListQuery<T>
	errorTitle: string
	emptyTitle: string
	emptyMessage?: string
	/** Shown until the first data arrives; defaults to pulsing rows. */
	skeleton?: ReactElement
}

/**
 * A list of server data in every state a cached query can be in. Before any data: offline notice
 * (the query is paused until the connection returns), a skeleton while fetching, or a blocking error
 * with Retry. Once data exists the rows stay on screen: a failed refresh shows an inline notice
 * above them whose Retry runs like a pull (spinner included), also over an empty result.
 *
 * A disabled query (`enabled: false`, e.g. waiting for a user id) has no data and is idle; it keeps
 * showing the skeleton until it is enabled.
 */
export function CachedList<T>({
	query: { data, error, isError, refetch, fetchStatus },
	errorTitle,
	emptyTitle,
	emptyMessage,
	skeleton,
	...listProps
}: CachedListProps<T>) {
	const { t } = useTranslation()
	const { refreshing, onRefresh } = usePullToRefresh(refetch)

	if (data === undefined) {
		if (fetchStatus === 'paused') {
			return <ScreenState message={t('cachedList.offlineMessage')} title={t('cachedList.offlineTitle')} />
		}
		// A retry after a failed first load keeps `status: 'error'` while fetching; show progress.
		if (isError && fetchStatus !== 'fetching') {
			return (
				<ScreenState
					actionLabel={t('cachedList.retry')}
					message={requestErrorMessage(error, t)}
					onAction={() => refetch()}
					title={errorTitle}
				/>
			)
		}
		return skeleton ?? <DefaultSkeleton label={t('cachedList.loading')} />
	}

	return (
		<FlashList
			{...listProps}
			data={data}
			ListEmptyComponent={<ScreenState message={emptyMessage ?? t('cachedList.emptyMessage')} title={emptyTitle} />}
			ListHeaderComponent={
				isError ? <RefreshError message={requestErrorMessage(error, t)} onRetry={onRefresh} /> : null
			}
			onRefresh={onRefresh}
			// Offline, TanStack pauses the refetch until the connection returns; don't spin that long.
			refreshing={refreshing && fetchStatus !== 'paused'}
		/>
	)
}

function RefreshError({ message, onRetry }: { message: string; onRetry: () => void }) {
	const { t } = useTranslation()
	return (
		<View
			accessibilityLiveRegion="polite"
			className="mx-4 mb-2 mt-3 flex-row items-center gap-3 rounded-2xl bg-danger-soft px-4 py-3">
			<AppText className="flex-1 text-text" variant="ts">
				{t('cachedList.refreshFailed', { message })}
			</AppText>
			<Pressable
				accessibilityRole="button"
				className="min-h-[48px] min-w-[48px] items-center justify-center"
				hitSlop={8}
				onPress={onRetry}>
				{/* Body text colour: accent is below AA on the tinted notice (3.5:1 light, 4.1:1 dark). */}
				<AppText className="text-text underline" variant="btn">
					{t('cachedList.retry')}
				</AppText>
			</Pressable>
		</View>
	)
}

function DefaultSkeleton({ label }: { label: string }) {
	return (
		<View accessibilityLabel={label} accessible className="gap-3 px-4 pt-4">
			{Array.from({ length: SKELETON_ROWS }, (_, i) => (
				<SkeletonPulse className="h-14 rounded-2xl" key={i} />
			))}
		</View>
	)
}
