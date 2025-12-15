import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import { useEffect, useState } from 'react'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import { Button, Colors } from 'react-native-ui-lib'
import { AppText } from '@app/components/shared'
import { useChatStore } from '@app/hooks/useChatStore'
import useOcr from '@app/hooks/useOcr'
import ImageGalleryModal from './ImageGalleryModal'
import ImageStack from './ImageStack'

type ImageAsset = {
	uri: string
	width?: number
	height?: number
	fileName?: string
	mimeType?: string
}

const Home = () => {
	const [images, setImages] = useState<ImageAsset[]>([])
	const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false)

	const router = useRouter()
	const setMessages = useChatStore(state => state.setMessages)
	const { mutate: analyzeImages, isPending, error } = useOcr()

	const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()

	// Handle images shared from external apps
	useEffect(() => {
		if (hasShareIntent && shareIntent?.files?.length) {
			setImages(
				shareIntent.files.map(file => ({
					uri: file.path,
					width: file.width ?? undefined,
					height: file.height ?? undefined,
					fileName: file.fileName,
					mimeType: file.mimeType,
				})),
			)
			resetShareIntent()
		}
	}, [hasShareIntent, shareIntent, resetShareIntent])

	const handleAnalyze = () => {
		if (images.length === 0) return

		analyzeImages(images, {
			onSuccess: messages => {
				setMessages(messages)
				router.push('/ChatAnalysis')
			},
		})
	}

	const pickImageFromGallery = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsMultipleSelection: true,
			quality: 1,
		})
		if (result.canceled) return
		if (result.assets?.length) {
			setImages(
				result.assets.map(asset => ({
					uri: asset.uri,
					width: asset.width,
					height: asset.height,
					fileName: asset.fileName ?? undefined,
					mimeType: asset.mimeType ?? undefined,
				})),
			)
		}
	}

	const reselectImages = () => {
		setImages([])
		pickImageFromGallery()
	}

	return (
		<View className="flex-1 items-center justify-center gap-10 bg-lightGrayBlue">
			{images?.length === 0 ? (
				<TouchableOpacity
					className="h-[200] w-[200] items-center justify-center rounded-md bg-darkGrayBlue opacity-70"
					onPress={pickImageFromGallery}>
					<AppText className="text-white">{'pick chat screenshot'}</AppText>
				</TouchableOpacity>
			) : (
				<TouchableOpacity disabled={isPending} onPress={() => setIsPreviewModalVisible(true)}>
					<ImageStack images={images} />
				</TouchableOpacity>
			)}

			{error && (
				<AppText className="px-4 text-center text-red-500">{'Failed to analyze images. Please try again.'}</AppText>
			)}

			{images?.length > 0 && (
				<View className="items-center justify-center gap-4">
					<Button
						bg-primary
						className="h-10 w-[200]"
						disabled={isPending}
						label={isPending ? '' : 'Analyze'}
						onPress={handleAnalyze}>
						{isPending && <ActivityIndicator color={Colors.white} />}
					</Button>
					<Button
						disabled={isPending}
						hyperlink
						label={'Reselect images'}
						onPress={reselectImages}
						primary
						testID="reselect-images-button"
					/>
				</View>
			)}

			<ImageGalleryModal
				images={images}
				onClose={() => setIsPreviewModalVisible(false)}
				visible={isPreviewModalVisible}
			/>
		</View>
	)
}

export default Home
