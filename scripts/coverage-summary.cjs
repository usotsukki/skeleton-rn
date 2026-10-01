#!/usr/bin/env node
// Merges Jest `coverage-final.json` files (one per CI test shard) and prints the totals as a Markdown
// table for the GitHub job summary: node scripts/coverage-summary.cjs coverage-*/coverage-final.json
// Same arithmetic as istanbul (Jest's coverage library), without needing node_modules in that job.
const fs = require('fs')

/** Hit counts add up across shards: each shard ran other tests over the same files. */
function mergeFile(into, from) {
	if (!into) return structuredClone(from)
	for (const key of Object.keys(from.s)) into.s[key] = (into.s[key] ?? 0) + from.s[key]
	for (const key of Object.keys(from.f)) into.f[key] = (into.f[key] ?? 0) + from.f[key]
	for (const key of Object.keys(from.b)) {
		into.b[key] = from.b[key].map((count, i) => (into.b[key]?.[i] ?? 0) + count)
	}
	return into
}

function merge(reports) {
	const files = {}
	for (const report of reports) {
		for (const [file, coverage] of Object.entries(report)) files[file] = mergeFile(files[file], coverage)
	}
	return files
}

/** istanbul-lib-coverage's percent(): two decimals, truncated. */
const percent = (covered, total) => (total > 0 ? Math.floor((1000 * 100 * covered) / total / 10) / 100 : 100)

function totals(files) {
	const sum = { statements: [0, 0], branches: [0, 0], functions: [0, 0], lines: [0, 0] }
	const add = (metric, counts) => {
		sum[metric][0] += counts.filter(count => count > 0).length
		sum[metric][1] += counts.length
	}
	for (const file of Object.values(files)) {
		add('statements', Object.values(file.s))
		add('functions', Object.values(file.f))
		add('branches', Object.values(file.b).flat())
		// A line counts once, with its best-covered statement.
		const lines = {}
		for (const [key, count] of Object.entries(file.s)) {
			const line = file.statementMap[key].start.line
			lines[line] = Math.max(lines[line] ?? 0, count)
		}
		add('lines', Object.values(lines))
	}
	return Object.fromEntries(Object.entries(sum).map(([metric, [covered, total]]) => [metric, percent(covered, total)]))
}

function markdown(pct) {
	return [
		'### Coverage',
		'',
		'| Statements | Branches | Functions | Lines |',
		'| --- | --- | --- | --- |',
		`| ${pct.statements}% | ${pct.branches}% | ${pct.functions}% | ${pct.lines}% |`,
		'',
	].join('\n')
}

if (require.main === module) {
	const paths = process.argv.slice(2)
	if (paths.length === 0) {
		console.error('usage: coverage-summary.cjs <coverage-final.json>...')
		process.exit(1)
	}
	process.stdout.write(markdown(totals(merge(paths.map(p => JSON.parse(fs.readFileSync(p, 'utf8')))))))
}

module.exports = { merge, totals, markdown }
