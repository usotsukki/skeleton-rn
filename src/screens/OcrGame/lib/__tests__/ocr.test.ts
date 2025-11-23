import { toNameNumberPairs } from '../ocr'

describe('toNameNumberPairs', () => {
	it('should pair items that are on the same line', () => {
		const result = {
			textBlocks: [
				{
					lines: [
						{
							elements: [
								{ text: 'Name1', frame: { left: 0, right: 10, top: 0, bottom: 10 } },
								{ text: '100', frame: { left: 20, right: 30, top: 0, bottom: 10 } },
							],
						},
					],
				},
			],
		}
		const pairs = toNameNumberPairs(result)
		expect(pairs).toEqual([{ name: 'Name1', number: '100' }])
	})

	it('should pair items based on vertical overlap', () => {
		const result = {
			textBlocks: [
				{
					lines: [
						{
							elements: [{ text: 'Name1', frame: { left: 0, right: 10, top: 0, bottom: 10 } }],
						},
						{
							elements: [{ text: '100', frame: { left: 20, right: 30, top: 2, bottom: 12 } }],
						},
					],
				},
			],
		}
		const pairs = toNameNumberPairs(result)
		expect(pairs).toEqual([{ name: 'Name1', number: '100' }])
	})

	it('should handle multiple pairs with overlap', () => {
		const result = {
			textBlocks: [
				{
					lines: [
						{
							elements: [{ text: 'Name1', frame: { left: 0, right: 10, top: 0, bottom: 10 } }],
						},
						{
							elements: [{ text: 'Name2', frame: { left: 0, right: 10, top: 20, bottom: 30 } }],
						},
						{
							elements: [{ text: '100', frame: { left: 20, right: 30, top: 2, bottom: 12 } }],
						},
						{
							elements: [{ text: '200', frame: { left: 20, right: 30, top: 22, bottom: 32 } }],
						},
					],
				},
			],
		}
		const pairs = toNameNumberPairs(result)
		expect(pairs).toHaveLength(2)
		expect(pairs).toContainEqual({ name: 'Name1', number: '100' })
		expect(pairs).toContainEqual({ name: 'Name2', number: '200' })
	})

	it('should ignore items with no match', () => {
		const result = {
			textBlocks: [
				{
					lines: [
						{
							elements: [{ text: 'Name1', frame: { left: 0, right: 10, top: 0, bottom: 10 } }],
						},
					],
				},
			],
		}
		const pairs = toNameNumberPairs(result)
		expect(pairs).toEqual([])
	})
})
