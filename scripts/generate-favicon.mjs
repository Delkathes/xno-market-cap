import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = path.join(ROOT, 'public', 'X_abstract.svg')
const TARGET = path.join(ROOT, 'public', 'favicon.ico')

const SIZES = [16, 32, 48]
const ICONDIR_BYTES = 6
const ICONDIRENTRY_BYTES = 16

async function renderFrame(size) {
	return sharp(SOURCE, { density: 512 })
		.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png({ palette: false, compressionLevel: 9, effort: 10 })
		.toBuffer()
}

function packIco(frames) {
	const header = Buffer.alloc(ICONDIR_BYTES)
	header.writeUInt16LE(0, 0)
	header.writeUInt16LE(1, 2)
	header.writeUInt16LE(frames.length, 4)

	let offset = ICONDIR_BYTES + ICONDIRENTRY_BYTES * frames.length
	const entries = []
	for (const frame of frames) {
		const entry = Buffer.alloc(ICONDIRENTRY_BYTES)
		entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 0)
		entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 1)
		entry.writeUInt8(0, 2)
		entry.writeUInt8(0, 3)
		entry.writeUInt16LE(1, 4)
		entry.writeUInt16LE(32, 6)
		entry.writeUInt32LE(frame.data.length, 8)
		entry.writeUInt32LE(offset, 12)
		entries.push(entry)
		offset += frame.data.length
	}

	return Buffer.concat([header, ...entries, ...frames.map((frame) => frame.data)])
}

await mkdir(path.dirname(TARGET), { recursive: true })

const frames = []
for (const size of SIZES) {
	frames.push({ size, data: await renderFrame(size) })
}

const ico = packIco(frames)
await writeFile(TARGET, ico)

console.log(`favicon written: ${path.relative(ROOT, TARGET)}`)
console.log(`frames: ${SIZES.join(', ')}px`)
console.log(`bytes:  ${ico.length}`)
