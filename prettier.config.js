module.exports = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 2,
	semi: false,
	singleQuote: true,
	quoteProps: 'consistent',
	jsxSingleQuote: false,
	bracketSpacing: true,
	bracketSameLine: true,
	arrowParens: 'avoid',
	trailingComma: 'all',
	singleAttributePerLine: false,

	plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
	importOrderSortSpecifiers: true,
	importOrderCaseInsensitive: true,
	importOrder: ['@assets/*', '@app/*', '^[../*]', '^[./*]'],
}
