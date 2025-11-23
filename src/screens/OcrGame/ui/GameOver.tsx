import { AppText } from '@shared'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ScrollView } from 'react-native'
import { Button, Colors, View } from 'react-native-ui-lib'
import { GameResult } from '../model/useOcrGame'

const { width } = Dimensions.get('window')

type GameOverProps = {
	results: GameResult[]
	onPlayAgain: () => void
	onScanNew: () => void
}

export const GameOver = ({ results, onPlayAgain, onScanNew }: GameOverProps) => {
	const { t } = useTranslation()
	const correctCount = results.filter(r => r.isCorrect).length
	const totalCount = results.length
	const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

	let message = t('modules.ocr.gameOver.keepPracticing')
	if (percentage === 100) message = t('modules.ocr.gameOver.perfectScore')
	else if (percentage >= 80) message = t('modules.ocr.gameOver.greatJob')
	else if (percentage >= 50) message = t('modules.ocr.gameOver.goodEffort')

	return (
		<View
			center
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				backgroundColor: Colors.blackTransparent6,
			}}>
			<View
				style={{
					width: width * 0.9,
					maxHeight: '80%',
					borderRadius: 24,
					padding: 24,
					backgroundColor: Colors.dark,
					borderWidth: 1,
					borderColor: Colors.whiteTransparent2,
					alignItems: 'center',
				}}>
				<AppText className="mb-2 text-2xl font-bold text-light">{message}</AppText>
				<AppText className="mb-6 text-center text-base text-lightGrayBlue">
					{t('modules.ocr.gameOver.resultMessage', { correct: correctCount, total: totalCount, percentage })}
				</AppText>

				<View flex width="100%" marginB-s4>
					<AppText className="mb-2 text-sm font-semibold uppercase text-lightGrayBlue">
						{t('modules.ocr.gameOver.review')}
					</AppText>
					<ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
						{results.map((result, index) => (
							<View
								row
								centerV
								key={index}
								paddingV-s2
								spread
								style={{ borderBottomWidth: 1, borderBottomColor: Colors.whiteTransparent1 }}>
								<View flex>
									<AppText className="text-base text-light">{result.pair.name}</AppText>
									<AppText className="text-sm text-lightGrayBlue">{result.pair.number}</AppText>
								</View>
								<AppText className="text-xl">{result.isCorrect ? '✅' : '❌'}</AppText>
							</View>
						))}
					</ScrollView>
				</View>

				<View row gap-s3 marginT-s2>
					<View flex>
						<Button
							borderRadius={14}
							color={Colors.light}
							backgroundColor={Colors.primary}
							label={t('modules.ocr.gameOver.playAgain')}
							onPress={onPlayAgain}
							size={Button.sizes.large}
						/>
					</View>
					<View flex>
						<Button
							borderColor={Colors.whiteTransparent3}
							borderRadius={14}
							color={Colors.light}
							outline
							label={t('modules.ocr.gameOver.scanNew')}
							onPress={onScanNew}
							size={Button.sizes.large}
						/>
					</View>
				</View>
			</View>
		</View>
	)
}
