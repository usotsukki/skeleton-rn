#!/usr/bin/env node
// Renders app icon, Android adaptive icon layers, splash icon, and notification icon
// from assets/brand/{skull.svg,brand.json}. sharp is not a project dependency:
//   npm install --prefix /tmp/brand-tool sharp
//   NODE_PATH=/tmp/brand-tool/node_modules node scripts/generate-brand-assets.cjs
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const brand = require(path.join(root, 'assets/brand/brand.json'))
const out = path.join(root, 'assets/png')

// Inner markup of the 24×24 Lucide icon, re-wrapped below at any size/offset.
const iconMarkup = fs
	.readFileSync(path.join(root, 'assets/brand/skull.svg'), 'utf8')
	.replace(/<!--[\s\S]*?-->/g, '')
	.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]

const [start, middle, end] = brand.gradient
const gradientDefs = `<defs><linearGradient id="brand" x1="0" y1="1" x2="1" y2="0">
<stop offset="0" stop-color="${start}"/><stop offset="0.5" stop-color="${middle}"/><stop offset="1" stop-color="${end}"/>
</linearGradient></defs>`

/** Icon centered in a `canvas`-px square, drawn `iconSize` px wide. */
const iconGroup = (canvas, iconSize, stroke = '#FFFFFF') => {
	const offset = (canvas - iconSize) / 2
	return `<g transform="translate(${offset} ${offset}) scale(${iconSize / 24})" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconMarkup}</g>`
}

const svg = (canvas, body) =>
	Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">${body}</svg>`,
	)

const assets = [
	// iOS icon: opaque, OS applies the mask. Icon at 56% like Raisin Eat.
	[
		'icon.png',
		svg(1024, `${gradientDefs}<rect width="1024" height="1024" fill="url(#brand)"/>${iconGroup(1024, 576)}`),
		true,
	],
	// Android adaptive: keep the glyph inside the 66% safe zone.
	['adaptive-background.png', svg(1024, `${gradientDefs}<rect width="1024" height="1024" fill="url(#brand)"/>`), true],
	['adaptive-foreground.png', svg(1024, iconGroup(1024, 432)), false],
	['adaptive-monochrome.png', svg(1024, iconGroup(1024, 432)), false],
	// Splash: the glyph fills the square; expo-splash-screen sizes it via `imageWidth`.
	['splash-icon.png', svg(1024, iconGroup(1024, 1024)), false],
	// Android status-bar icon: white on transparent with a little padding.
	['notification-icon.png', svg(96, iconGroup(96, 80)), false],
]

Promise.all(
	assets.map(async ([file, input, opaque]) => {
		let image = sharp(input).png()
		if (opaque) image = image.flatten({ background: middle })
		await image.toFile(path.join(out, file))
		console.log(`assets/png/${file}`)
	}),
).catch(err => {
	console.error(err)
	process.exit(1)
})
