import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import type { FlatListProps, StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const MIN_SAFE_BOTTOM = 24
const PADDING_H = 20

type Props<T> = Omit<FlatListProps<T>, 'contentContainerStyle'> & {
	contentContainerStyle?: StyleProp<ViewStyle>
}

export default function BottomSheetListView<T>({
	contentContainerStyle,
	keyboardShouldPersistTaps = 'handled',
	showsVerticalScrollIndicator = false,
	...rest
}: Props<T>) {
	const insets = useSafeAreaInsets()
	const paddingBottom = Math.max(insets.bottom, MIN_SAFE_BOTTOM) + MIN_SAFE_BOTTOM

	return (
		<BottomSheetFlatList
			contentContainerStyle={[{ flexGrow: 1, paddingHorizontal: PADDING_H, paddingBottom }, contentContainerStyle]}
			keyboardShouldPersistTaps={keyboardShouldPersistTaps}
			showsVerticalScrollIndicator={showsVerticalScrollIndicator}
			{...rest}
		/>
	)
}
