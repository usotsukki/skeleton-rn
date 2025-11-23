import { recognizeText } from '@infinitered/react-native-mlkit-text-recognition'
import * as ImagePicker from 'expo-image-picker'
import { UIImagePickerPresentationStyle } from 'expo-image-picker/build/ImagePicker.types'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import { Button, Colors, View } from 'react-native-ui-lib'
import { Background } from '@app/components'
import { AppText } from '@app/components/shared'
import { NameNumberPair, toNameNumberPairs } from '@app/screens/OcrGame/lib/ocr'
import { useOcrGameStore } from '@app/screens/OcrGame/model/ocrGameStore'

const Home = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const setOcrData = useOcrGameStore(state => state.setOcrData)

	const [photo, setPhoto] = useState<string | null>(null)
	const [text, setText] = useState<string | null>(null)
	const [pairs, setPairs] = useState<NameNumberPair[]>([])
	const [isScanning, setIsScanning] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const onSelectPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
		setError(null)
		setIsScanning(true)
		setPhoto(asset.uri)
		try {
			const result = await recognizeText(asset.uri)
			console.log('Raw OCR result:', JSON.stringify(result, null, 2))

			const extractedPairs = toNameNumberPairs(result)
			console.log('Extracted name/number pairs:', extractedPairs)

			setText(result.text)
			setPairs(extractedPairs)
			if (extractedPairs.length === 0) {
				setError(t('modules.ocr.scanner.errors.noRows'))
			}
		} catch (e) {
			console.error('OCR failed', e)
			setText(null)
			setPairs([])
			setError(t('modules.ocr.scanner.errors.generic'))
		} finally {
			setIsScanning(false)
		}
	}

	const selectPhotoFromLibrary = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (!permissionResult.granted) {
			alert(t('modules.ocr.scanner.errors.permission'))
			return
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			quality: 0.1,
			presentationStyle: UIImagePickerPresentationStyle.OVER_CURRENT_CONTEXT,
		})
		if (result.assets) {
			onSelectPhoto(result.assets[0])
		}
	}

	const handleContinue = () => {
		if (!photo || pairs.length === 0) {
			return
		}
		setOcrData({ imageUri: photo, pairs })
		router.push('/(tabs)/(home)/OcrGame')
	}

	return (
		<Background>
			<View flex paddingH-24 paddingV-32 spread>
				<View marginB-s4>
					<AppText className="text-3xl font-bold text-light">{t('modules.ocr.scanner.title')}</AppText>
					<AppText className="mt-2 text-base text-lightGrayBlue">{t('modules.ocr.scanner.description')}</AppText>
				</View>

				<View center marginV-s4>
					{photo && (
						<Image
							resizeMode="cover"
							source={{ uri: photo }}
							style={{
								width: 220,
								height: 220,
								borderRadius: 16,
								borderWidth: 2,
								borderColor: Colors.whiteTransparent4,
							}}
						/>
					)}
					{!photo && (
						<View
							width={220}
							height={220}
							br40
							center
							style={{
								borderRadius: 16,
								borderWidth: 1,
								borderStyle: 'dashed',
								borderColor: Colors.whiteTransparent3,
							}}>
							<AppText className="text-center text-lightGrayBlue">{t('modules.ocr.scanner.pickPhoto')}</AppText>
						</View>
					)}
				</View>

				<View gap-s3>
					<Button
						borderRadius={14}
						color={Colors.light}
						backgroundColor={Colors.primary}
						disabled={isScanning}
						label={
							isScanning
								? t('modules.ocr.scanner.scanning')
								: photo
									? t('modules.ocr.scanner.reselectPhoto')
									: t('modules.ocr.scanner.selectPhoto')
						}
						onPress={selectPhotoFromLibrary}
						size={Button.sizes.large}
					/>
					<Button
						borderRadius={14}
						color={Colors.light}
						backgroundColor={Colors.whiteTransparent2}
						disabled={isScanning || !photo || pairs.length === 0}
						label={t('modules.ocr.scanner.continue')}
						onPress={handleContinue}
						size={Button.sizes.large}
					/>
					{text && (
						<View marginT-s3>
							<AppText className="text-xs text-lightGrayBlue">
								{t('modules.ocr.scanner.detectedLines', { count: pairs.length })}
							</AppText>
						</View>
					)}
					{pairs.length > 0 && (
						<View marginT-s3>
							<AppText className="mb-1 text-xs font-semibold text-lightGrayBlue">
								{t('modules.ocr.scanner.preview')}
							</AppText>
							{pairs.slice(0, 4).map(pair => (
								<View row key={`${pair.name}-${pair.number}`} spread>
									<AppText className="text-xs text-lightGrayBlue">{pair.name}</AppText>
									<AppText className="text-xs text-lightGrayBlue">{pair.number}</AppText>
								</View>
							))}
							{pairs.length > 4 && (
								<AppText className="mt-1 text-xs text-lightGrayBlue">
									{t('modules.ocr.scanner.moreLines', { count: pairs.length - 4 })}
								</AppText>
							)}
						</View>
					)}
					{isScanning && (
						<View marginT-s3>
							<AppText className="text-xs text-lightGrayBlue">{t('modules.ocr.scanner.reading')}</AppText>
						</View>
					)}
					{error && (
						<View marginT-s3>
							<AppText className="text-xs text-orange">{error}</AppText>
						</View>
					)}
				</View>
			</View>
		</Background>
	)
}

export default Home
