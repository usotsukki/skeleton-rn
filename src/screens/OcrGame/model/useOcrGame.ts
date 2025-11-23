import { useMemo, useState } from 'react'
import { NameNumberPair } from '../lib/ocr'

export type GameResult = {
	pair: NameNumberPair
	isCorrect: boolean
}

export const useOcrGame = (pairs: NameNumberPair[]) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [results, setResults] = useState<GameResult[]>([])
	const [isFinished, setIsFinished] = useState(false)
	const [streak, setStreak] = useState(0)

	const currentPair = pairs[currentIndex]

	const { leftValue, rightValue, correctSide } = useMemo(() => {
		if (!currentPair) {
			return { leftValue: '', rightValue: '', correctSide: 'left' as const }
		}

		const otherNumbers = pairs.map(p => p.number).filter(num => num !== currentPair.number)

		// Handle edge case where there is only 1 pair total
		let fallbackOther: string
		if (otherNumbers.length > 0) {
			fallbackOther = otherNumbers[Math.floor(Math.random() * otherNumbers.length)]
		} else {
			const numVal = parseInt(currentPair.number.replace(/\D/g, ''), 10)
			if (!isNaN(numVal)) {
				fallbackOther = (numVal + Math.floor(Math.random() * 10) + 1).toString()
			} else {
				fallbackOther = '???'
			}
		}

		const side = Math.random() < 0.5 ? ('left' as const) : ('right' as const)

		return {
			correctSide: side,
			leftValue: side === 'left' ? currentPair.number : fallbackOther,
			rightValue: side === 'right' ? currentPair.number : fallbackOther,
		}
	}, [currentPair, pairs])

	const submitGuess = (direction: 'left' | 'right') => {
		if (!currentPair) return { isCorrect: false, isFinished: false }

		const guessedNumber = direction === 'left' ? leftValue : rightValue
		const isCorrect = guessedNumber === currentPair.number

		const newResult = { pair: currentPair, isCorrect }
		setResults(prev => [...prev, newResult])

		// Update streak
		setStreak(prev => {
			const next = isCorrect ? prev + 1 : 0
			return next
		})

		const nextIndex = currentIndex + 1
		const finished = nextIndex >= pairs.length

		if (finished) {
			setIsFinished(true)
		} else {
			setCurrentIndex(nextIndex)
		}

		return { isCorrect, isFinished: finished }
	}

	const resetGame = () => {
		setCurrentIndex(0)
		setResults([])
		setIsFinished(false)
		setStreak(0)
	}

	return {
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
	}
}
