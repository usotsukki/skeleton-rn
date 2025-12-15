import { useCallback, useRef, useState } from 'react'
import { Dimensions, FlatList, Image, Modal, Pressable, StatusBar, StyleSheet, View, ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppText } from '@app/components/shared'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type ImageAsset = {
	uri: string
	width?: number
	height?: number
}

type ImageGalleryModalProps = {
	images: ImageAsset[]
	visible: boolean
	initialIndex?: number
	onClose: () => void
}

const ImageGalleryModal = ({ images, visible, initialIndex = 0, onClose }: ImageGalleryModalProps) => {
	const insets = useSafeAreaInsets()
	const flatListRef = useRef<FlatList>(null)
	const [currentIndex, setCurrentIndex] = useState(initialIndex)

	const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
		if (viewableItems.length > 0 && viewableItems[0].index !== null) {
			setCurrentIndex(viewableItems[0].index)
		}
	}, [])

	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 50,
	}).current

	const renderItem = useCallback(
		({ item }: { item: ImageAsset }) => (
			<View style={styles.imageContainer}>
				<Image resizeMode="contain" source={{ uri: item.uri }} style={styles.image} />
			</View>
		),
		[],
	)

	const getItemLayout = useCallback(
		(_: unknown, index: number) => ({
			length: SCREEN_WIDTH,
			offset: SCREEN_WIDTH * index,
			index,
		}),
		[],
	)

	const keyExtractor = useCallback((item: ImageAsset, index: number) => `${item.uri}-${index}`, [])

	return (
		<Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
			<StatusBar backgroundColor="black" barStyle="light-content" />
			<View style={styles.container}>
				<Pressable hitSlop={16} onPress={onClose} style={[styles.closeButton, { top: insets.top + 12 }]}>
					<AppText className="text-2xl text-white">{'✕'}</AppText>
				</Pressable>

				<FlatList
					data={images}
					decelerationRate="fast"
					getItemLayout={getItemLayout}
					horizontal
					initialScrollIndex={initialIndex}
					keyExtractor={keyExtractor}
					onViewableItemsChanged={onViewableItemsChanged}
					pagingEnabled
					ref={flatListRef}
					renderItem={renderItem}
					showsHorizontalScrollIndicator={false}
					viewabilityConfig={viewabilityConfig}
				/>

				{/* Page indicator */}
				{images.length > 1 && (
					<View style={[styles.paginationContainer, { bottom: insets.bottom + 24 }]}>
						<View style={styles.paginationPill}>
							<AppText className="text-sm font-semibold text-white">
								{currentIndex + 1} / {images.length}
							</AppText>
						</View>

						{/* Dot indicators */}
						<View style={styles.dotsContainer}>
							{images.map((_, index) => (
								<View key={index} style={[styles.dot, index === currentIndex && styles.dotActive]} />
							))}
						</View>
					</View>
				)}
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
	closeButton: {
		position: 'absolute',
		right: 16,
		zIndex: 10,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(255,255,255,0.15)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imageContainer: {
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT * 0.8,
	},
	paginationContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		alignItems: 'center',
		gap: 12,
	},
	paginationPill: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 16,
	},
	dotsContainer: {
		flexDirection: 'row',
		gap: 6,
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: 'rgba(255,255,255,0.4)',
	},
	dotActive: {
		backgroundColor: 'white',
		width: 18,
	},
})

export default ImageGalleryModal
