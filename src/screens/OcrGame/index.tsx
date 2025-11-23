import { AppText } from '@shared'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSharedValue, withSpring } from 'react-native-reanimated'
import { Button, Colors, View } from 'react-native-ui-lib'
import { Background } from '@app/components'
import { useHaptics } from '@app/hooks'
import { useOcrGameStore } from './model/ocrGameStore'
import { useOcrGame } from './model/useOcrGame'
import { Card } from './ui/Card'
import { GameOver } from './ui/GameOver'
import { ProgressBar } from './ui/ProgressBar'

const OcrGame = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const imageUri = useOcrGameStore(state => state.imageUri)
	const pairs = useOcrGameStore(state => state.pairs)
	const resetOcrData = useOcrGameStore(state => state.resetOcrData)

	const {
		currentIndex,
		currentPair,
		leftValue,
		rightValue,
		correctSide,
		results,
		isFinished,
		streak,
		submitGuess,
		resetGame,
	} = useOcrGame(pairs)

	const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
	const [highlightCorrect, setHighlightCorrect] = useState<'left' | 'right' | null>(null)

	const translateX = useSharedValue(0)
	const scale = useSharedValue(1)

	const { triggerNotification } = useHaptics()

	// If we don't have data, send the user back home.
	useEffect(() => {
		if (!imageUri || pairs.length === 0) {
			router.replace('/(tabs)/(home)/Home')
		}
	}, [imageUri, pairs.length, router])

	const handleSwipeComplete = (direction: 'left' | 'right') => {
		const { isCorrect } = submitGuess(direction)

		if (isCorrect) {
			setFeedback('correct')
			triggerNotification()
			// Quick transition for correct answers
			setTimeout(() => {
				setFeedback(null)
				translateX.value = 0
				scale.value = withSpring(1, { damping: 18, stiffness: 220 })
			}, 600)
		} else {
			setFeedback('wrong')
			setHighlightCorrect(correctSide)
			triggerNotification()
			// Longer delay for wrong answers to let user see the correct one
			setTimeout(() => {
				setFeedback(null)
				setHighlightCorrect(null)
				translateX.value = 0
				scale.value = withSpring(1, { damping: 18, stiffness: 220 })
			}, 1500)
		}
	}

	const handlePlayAgain = () => {
		resetGame()
		setFeedback(null)
		setHighlightCorrect(null)
		translateX.value = 0
		scale.value = 1
	}

	const handleScanNew = () => {
		resetOcrData()
		router.replace('/(tabs)/(home)/Home')
	}

	if (!currentPair && !isFinished) {
		return null
	}

	const progress = pairs.length > 0 ? currentIndex / pairs.length : 0

	return (
		<Background>
			<View flex paddingH-24 paddingV-24>
				<View row centerV marginB-s4 spread>
					<View>
						<AppText className="text-sm text-lightGrayBlue">{t('modules.ocr.game.progress')}</AppText>
						<AppText className="mt-1 text-xl font-bold text-light">
							{t('modules.ocr.game.cardCounter', {
								current: Math.min(currentIndex + 1, pairs.length),
								total: pairs.length,
							})}
						</AppText>
					</View>
					<View right>
						<AppText className="text-xs uppercase text-lightGrayBlue">
							{t('modules.ocr.game.score', { correct: results.filter(r => r.isCorrect).length, total: pairs.length })}
						</AppText>
						<AppText className="text-xs text-lightGrayBlue">
							{streak > 1 ? t('modules.ocr.game.streak', { count: streak }) : t('modules.ocr.game.matchTerm')}
						</AppText>
					</View>
				</View>

				<View marginB-s4>
					<ProgressBar progress={progress} />
				</View>

				<View row width="100%" gap-s2 marginB-s4 paddingH-s2 spread>
					<View
						flex
						backgroundColor={highlightCorrect === 'left' ? Colors.green30 : Colors.whiteTransparent1}
						br40
						padding-s3
						style={{ borderWidth: 1, borderColor: highlightCorrect === 'left' ? Colors.green10 : Colors.transparent }}>
						<AppText className="text-xs uppercase text-lightGrayBlue">{t('modules.ocr.game.leftOption')}</AppText>
						<AppText adjustsFontSizeToFit className="mt-1 text-2xl font-semibold text-light" numberOfLines={1}>
							{leftValue}
						</AppText>
					</View>
					<View
						right
						flex
						backgroundColor={highlightCorrect === 'right' ? Colors.green30 : Colors.whiteTransparent1}
						br40
						padding-s3
						style={{ borderWidth: 1, borderColor: highlightCorrect === 'right' ? Colors.green10 : Colors.transparent }}>
						<AppText className="text-xs uppercase text-lightGrayBlue">{t('modules.ocr.game.rightOption')}</AppText>
						<AppText adjustsFontSizeToFit className="mt-1 text-2xl font-semibold text-light" numberOfLines={1}>
							{rightValue}
						</AppText>
					</View>
				</View>

				<View flex center>
					{currentPair && !isFinished && (
						<>
							<Card
								key={currentIndex}
								name={currentPair.name}
								onSwipeComplete={handleSwipeComplete}
								scale={scale}
								translateX={translateX}
							/>

							<View height={30} marginT-s4>
								{feedback === 'correct' && (
									<AppText className="text-center text-base font-semibold text-lime">
										{t('modules.ocr.game.correct')}
									</AppText>
								)}
								{feedback === 'wrong' && (
									<AppText className="text-center text-base font-semibold text-orange">
										{t('modules.ocr.game.wrong')}
									</AppText>
								)}
							</View>
						</>
					)}
				</View>

				<View marginT-s4>
					<Button
						borderColor={Colors.whiteTransparent3}
						color={Colors.light}
						outline
						label={t('modules.ocr.game.exit')}
						onPress={handleScanNew}
					/>
				</View>

				{isFinished && <GameOver onPlayAgain={handlePlayAgain} onScanNew={handleScanNew} results={results} />}
			</View>
		</Background>
	)
}

export default OcrGame
