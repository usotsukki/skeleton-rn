import { Image, View } from 'react-native'

type ImageAsset = {
	uri: string
	width?: number
	height?: number
}

const ImageStack = ({ images }: { images: ImageAsset[] }) => {
	const total = images.length

	const getJitterForImage = (image: ImageAsset, index: number) => {
		const key = `${image.uri}-${index}`
		let hash = 0
		for (let i = 0; i < key.length; i += 1) {
			hash = (hash * 31 + key.charCodeAt(i)) | 0
		}

		const seeded = Math.abs(Math.sin(hash))
		const seeded2 = Math.abs(Math.sin(hash * 1.37))

		const r1 = seeded * 2 - 1
		const r2 = seeded2 * 2 - 1

		return {
			rotate: r1 * 12,
			offsetX: r2 * 16,
		}
	}

	const getStyleForIndex = (image: ImageAsset, index: number) => {
		if (total === 1) {
			return {
				top: 50,
				left: 50,
				zIndex: 1,
				transform: [],
			}
		}

		const center = (total - 1) / 2
		const relative = index - center

		const baseTop = 40
		const baseLeft = 50

		const jitter = getJitterForImage(image, index)

		const top = baseTop + index * 12
		const left = baseLeft + relative * 4 + jitter.offsetX
		const rotate = jitter.rotate

		return {
			top,
			left,
			zIndex: index + 1,
			transform: [{ rotate: `${rotate}deg` }],
		}
	}

	return (
		<View className="h-[300] w-[300] items-center justify-center rounded-md shadow-md">
			{images.map((image, i) => (
				<Image
					className="absolute h-[200] w-[200] rounded-md"
					key={image.uri}
					source={{ uri: image.uri }}
					style={getStyleForIndex(image, i)}
				/>
			))}
		</View>
	)
}

export default ImageStack
