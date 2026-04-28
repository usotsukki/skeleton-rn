import { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet'
import { FlashList, type FlashListProps, type FlashListRef } from '@shopify/flash-list'
import { forwardRef, type ReactElement, type Ref } from 'react'

export type BottomSheetFlashListViewProps<T> = FlashListProps<T>

// `renderScrollComponent` is the supported FlashList-in-BottomSheet path on
// `@gorhom/bottom-sheet@5+`; the older `createAnimatedComponent(FlashList)`
// pattern fights FlashList v2 internals and produces sluggish snap-back scroll.
function BottomSheetFlashListViewInner<T>(
	props: BottomSheetFlashListViewProps<T>,
	ref: Ref<FlashListRef<T>>,
): ReactElement | null {
	const renderScrollComponent = useBottomSheetScrollableCreator()
	return <FlashList<T> {...props} ref={ref} renderScrollComponent={renderScrollComponent} />
}

const BottomSheetFlashListView = forwardRef(BottomSheetFlashListViewInner) as <T>(
	props: BottomSheetFlashListViewProps<T> & { ref?: Ref<FlashListRef<T>> },
) => ReactElement | null

export default BottomSheetFlashListView
