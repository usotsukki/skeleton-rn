import { useMutation } from '@tanstack/react-query'
import { File } from 'expo-file-system/next'
import { getMessagesFromImage } from '@app/api/ocr'
import { ChatMessage } from '@app/types/chat'

type ImageInput = {
	uri: string
	mimeType?: string
}

const useOcr = () => {
	return useMutation({
		mutationFn: async (images: ImageInput[]): Promise<ChatMessage[]> => {
			const messageArrays = await Promise.all(
				images.map(async image => {
					const file = new File(image.uri)
					const base64 = await file.base64()
					return getMessagesFromImage(base64, image.mimeType)
				}),
			)
			return messageArrays.flat()
		},
	})
}

export default useOcr
