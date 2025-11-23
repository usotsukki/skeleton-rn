export type NameNumberPair = {
	name: string
	number: string
}

type Frame = {
	left: number
	right: number
	top: number
	bottom: number
}

type TextElement = {
	text: string
	frame: Frame
}

type TextLine = {
	elements: TextElement[]
}

type TextBlock = {
	lines: TextLine[]
}

type OcrLikeResult = {
	textBlocks: TextBlock[]
}

export const toNameNumberPairs = (result: OcrLikeResult): NameNumberPair[] => {
	const pairs: NameNumberPair[] = []

	const centerX = (frame: Pick<Frame, 'left' | 'right'>) => (frame.left + frame.right) / 2
	const height = (frame: Pick<Frame, 'top' | 'bottom'>) => frame.bottom - frame.top

	const leftSingles: { text: string; frame: Frame }[] = []
	const rightSingles: { text: string; frame: Frame }[] = []
	const singleElementCenters: number[] = []

	// First pass: handle lines that already contain "name number" in a single line
	for (const block of result.textBlocks) {
		for (const line of block.lines) {
			if (line.elements.length === 2) {
				const [left, right] = [...line.elements].sort((a, b) => centerX(a.frame) - centerX(b.frame))
				pairs.push({ name: left.text, number: right.text })
			} else if (line.elements.length === 1) {
				const el = line.elements[0]
				singleElementCenters.push(centerX(el.frame))
			}
		}
	}

	if (singleElementCenters.length === 0) {
		return pairs
	}

	// Use the average X as a split between left and right columns
	const splitX = singleElementCenters.reduce((sum, x) => sum + x, 0) / singleElementCenters.length

	// Second pass: collect single elements into left/right columns
	for (const block of result.textBlocks) {
		for (const line of block.lines) {
			if (line.elements.length !== 1) continue

			const el = line.elements[0]
			const x = centerX(el.frame)

			if (x < splitX) {
				leftSingles.push({ text: el.text, frame: el.frame })
			} else {
				rightSingles.push({ text: el.text, frame: el.frame })
			}
		}
	}

	// Match left items to right items based on vertical overlap
	// We iterate through left items and find the best matching right item
	for (const leftItem of leftSingles) {
		const leftH = height(leftItem.frame)

		let bestMatch: { text: string; frame: Frame } | null = null
		let bestOverlap = -Infinity

		for (const rightItem of rightSingles) {
			const rightH = height(rightItem.frame)

			// Calculate vertical overlap between intervals [top, bottom]
			const overlapTop = Math.max(leftItem.frame.top, rightItem.frame.top)
			const overlapBottom = Math.min(leftItem.frame.bottom, rightItem.frame.bottom)
			const overlapHeight = Math.max(0, overlapBottom - overlapTop)

			// If overlap is significant (> 50% of smaller height), it's a strong candidate
			const minHeight = Math.min(leftH, rightH)

			if (overlapHeight > minHeight * 0.5 && overlapHeight > bestOverlap) {
				bestOverlap = overlapHeight
				bestMatch = rightItem
			}
		}

		// If we found a match via overlap
		if (bestMatch) {
			pairs.push({
				name: leftItem.text,
				number: bestMatch.text,
			})
			// Remove matched item from rightSingles to avoid double matching?
			// For now, let's assume 1-to-1.
			const index = rightSingles.indexOf(bestMatch)
			if (index > -1) {
				rightSingles.splice(index, 1)
			}
		}
	}

	return pairs
}
