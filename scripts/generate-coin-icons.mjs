import { createHash } from 'node:crypto'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'coins')
const TMP_DIR = path.join(ROOT, 'public', 'coins.tmp')
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'coin-icons.json')

const SIZES = [64, 96]
const CONCURRENCY = 6
const QUALITY = 80

// Coin icons are mirrored locally so browsers never reach a third-party CDN for
// them. Filenames embed a hash of the upstream URL, so a logo change produces a
// new filename and the files can be served immutable. Any coin missing from the
// manifest falls back to its remote URL at render time.
const baseUrlArg = process.argv.find((argument) => argument.startsWith('--base-url='))
const baseUrl = (baseUrlArg ? baseUrlArg.split('=')[1] : 'http://localhost:3000').replace(/\/$/, '')

async function fetchCoins() {
	const response = await fetch(`${baseUrl}/api/market-data`, {
		headers: { 'sec-fetch-site': 'same-origin' },
	})
	if (!response.ok) {
		throw new Error(
			`coin list request failed: HTTP ${response.status} from ${baseUrl}/api/market-data. Is the server running?`,
		)
	}
	const payload = await response.json()
	const coins = payload?.data
	if (!Array.isArray(coins) || coins.length === 0) {
		throw new Error('coin list response contained no coins')
	}
	return coins
}

async function renderCoin(coin) {
	if (!coin.image) {
		throw new Error('no image url')
	}
	const response = await fetch(coin.image)
	if (!response.ok) {
		throw new Error(`image fetch HTTP ${response.status}`)
	}
	const source = Buffer.from(await response.arrayBuffer())
	const hash = createHash('sha256').update(coin.image).digest('hex').slice(0, 8)

	for (const size of SIZES) {
		const buffer = await sharp(source)
			.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
			.webp({ quality: QUALITY, effort: 6 })
			.toBuffer()
		await writeFile(path.join(TMP_DIR, `${coin.id}-${hash}-${size}.webp`), buffer)
	}

	return { id: coin.id, hash }
}

async function run() {
	const coins = await fetchCoins()

	const unique = new Map()
	for (const coin of coins) {
		if (unique.has(coin.id)) {
			console.warn(`duplicate coin id, keeping first: ${coin.id}`)
			continue
		}
		unique.set(coin.id, coin)
	}
	const list = [...unique.values()]

	await rm(TMP_DIR, { recursive: true, force: true })
	await mkdir(TMP_DIR, { recursive: true })

	const entries = []
	const failures = []
	let cursor = 0

	await Promise.all(
		Array.from({ length: Math.min(CONCURRENCY, list.length) }, async () => {
			while (cursor < list.length) {
				const coin = list[cursor++]
				try {
					entries.push(await renderCoin(coin))
				} catch (error) {
					failures.push(`${coin.id}: ${error.message}`)
				}
			}
		}),
	)

	if (entries.length === 0) {
		await rm(TMP_DIR, { recursive: true, force: true })
		throw new Error('no icons were generated')
	}

	await rm(OUT_DIR, { recursive: true, force: true })
	await rename(TMP_DIR, OUT_DIR)

	const manifest = {}
	for (const entry of entries.sort((a, b) => a.id.localeCompare(b.id))) {
		manifest[entry.id] = entry.hash
	}
	await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)

	console.log(`icons written: ${entries.length} coins, ${entries.length * SIZES.length} files`)
	console.log(`sizes: ${SIZES.join(', ')}px webp q${QUALITY}`)
	console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)}`)
	console.log(`output:   ${path.relative(ROOT, OUT_DIR)}`)

	if (failures.length > 0) {
		console.error(`failed: ${failures.length}`)
		for (const failure of failures) {
			console.error(`  ${failure}`)
		}
		process.exitCode = 1
	}
}

await run()
