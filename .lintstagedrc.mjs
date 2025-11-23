import { ESLint } from 'eslint'

const removeIgnoredFiles = async files => {
	const eslint = new ESLint()
	const isIgnored = await Promise.all(
		files.map(file => {
			return eslint.isPathIgnored(file)
		}),
	)
	const filteredFiles = files.filter((_, i) => !isIgnored[i])
	return filteredFiles.join(' ')
}

export default {
	'*.{js,jsx,ts,tsx,json,html}': ['prettier . --write'],
	'*.{ts,tsx}': files => {
		const filteredFiles = files.filter(f => !f.includes('/libs/'))
		if (filteredFiles.length === 0) return []
		return ['npm run lint:ts']
	},
	'**/*.{ts,tsx,js,jsx}': async files => {
		const nonLibFiles = files.filter(f => !f.includes('/libs/'))
		const filesToLint = await removeIgnoredFiles(nonLibFiles)
		if (filesToLint.length === 0) return []
		return [`eslint ${filesToLint}`]
	},
}
