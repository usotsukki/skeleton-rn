import { ESLint } from 'eslint'

const quote = files => files.map(file => `"${file}"`).join(' ')

// ESLint warns on explicitly passed ignored files, which --max-warnings=0 turns into a failed commit.
const withoutEslintIgnored = async files => {
	const eslint = new ESLint()
	const ignored = await Promise.all(files.map(file => eslint.isPathIgnored(file)))
	return files.filter((_, i) => !ignored[i])
}

export default {
	// One task per glob so eslint --fix, prettier and tsc run in order, not concurrently.
	'*.{js,jsx,mjs,ts,tsx}': async files => {
		const lintable = await withoutEslintIgnored(files)
		return [
			...(lintable.length ? [`eslint --cache --fix --max-warnings=0 ${quote(lintable)}`] : []),
			`prettier --cache --write ${quote(files)}`,
			// Project-wide on purpose: staged-file-only checks miss breakage in importers.
			'tsc --noEmit',
		]
	},
	'*.{json,jsonc,yml,yaml,css}': files => `prettier --cache --write ${quote(files)}`,
}
