const { merge, totals, markdown } = require('../coverage-summary.cjs') as {
	merge: (reports: Record<string, FileCoverage>[]) => Record<string, FileCoverage>
	totals: (files: Record<string, FileCoverage>) => Record<'statements' | 'branches' | 'functions' | 'lines', number>
	markdown: (pct: Record<string, number>) => string
}

interface FileCoverage {
	statementMap: Record<string, { start: { line: number } }>
	s: Record<string, number>
	f: Record<string, number>
	b: Record<string, number[]>
}

/** Four statements on three lines, two functions, one if/else. */
const file = (s: number[], f: number[], b: number[]): FileCoverage => ({
	statementMap: {
		0: { start: { line: 1 } },
		1: { start: { line: 2 } },
		2: { start: { line: 2 } },
		3: { start: { line: 3 } },
	},
	s: Object.fromEntries(s.map((count, i) => [i, count])),
	f: Object.fromEntries(f.map((count, i) => [i, count])),
	b: { 0: b },
})

describe('coverage-summary', () => {
	it('adds hits from every shard before counting what is covered', () => {
		const shard1 = { 'a.ts': file([1, 0, 0, 0], [1, 0], [1, 0]) }
		const shard2 = { 'a.ts': file([0, 0, 2, 0], [0, 0], [0, 0]), 'b.ts': file([0, 0, 0, 0], [0, 0], [0, 0]) }

		expect(totals(merge([shard1, shard2]))).toEqual({
			statements: 25, // 2 of 8
			functions: 25, // 1 of 4
			branches: 25, // 1 of 4
			lines: 33.33, // a.ts lines 1 and 2 of 6 (statements 1 and 2 share line 2)
		})
	})

	it('does not change the shard reports it merges', () => {
		const shard1 = { 'a.ts': file([1, 0, 0, 0], [1, 0], [1, 0]) }
		merge([shard1, { 'a.ts': file([1, 1, 1, 1], [1, 1], [1, 1]) }])
		expect(shard1['a.ts'].s).toEqual({ 0: 1, 1: 0, 2: 0, 3: 0 })
	})

	it('truncates to two decimals like istanbul (2 of 3 is 66.66, not 66.67)', () => {
		expect(totals({ 'a.ts': file([1, 0, 0, 1], [1, 0], [1, 0]) }).lines).toBe(66.66)
	})

	it('reports an empty run as fully covered, like istanbul', () => {
		expect(totals({})).toEqual({ statements: 100, functions: 100, branches: 100, lines: 100 })
	})

	it('prints the job summary table', () => {
		expect(markdown({ statements: 80, branches: 70.5, functions: 60, lines: 81.25 })).toContain(
			'| 80% | 70.5% | 60% | 81.25% |',
		)
	})
})
