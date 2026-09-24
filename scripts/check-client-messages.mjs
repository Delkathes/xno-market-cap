import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROVIDERS = path.join(ROOT, 'src', 'components', 'providers.tsx')
const MESSAGES_DIR = path.join(ROOT, 'messages')
const LOCALES = ['en', 'nl', 'es', 'it', 'de', 'fr']

function readSourceFiles(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) readSourceFiles(full, out)
		else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full)
	}
	return out
}

function relative(file) {
	return path.relative(ROOT, file).split(path.sep).join('/')
}

function sliceBalanced(text, openIndex, open, close) {
	let depth = 0
	for (let i = openIndex; i < text.length; i++) {
		if (text[i] === open) depth++
		else if (text[i] === close) {
			depth--
			if (depth === 0) return text.slice(openIndex + 1, i)
		}
	}
	throw new Error(`unbalanced ${open}${close} at index ${openIndex}`)
}

function extractStringArray(text, name) {
	const nameIndex = text.indexOf(name)
	if (nameIndex === -1) throw new Error(`could not find ${name} in providers.tsx`)
	const openIndex = text.indexOf('[', nameIndex)
	const body = sliceBalanced(text, openIndex, '[', ']')
	return [...body.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2])
}

function extractPartialNeeds(text) {
	const nameIndex = text.indexOf('PARTIAL_CLIENT_NEEDS')
	if (nameIndex === -1) throw new Error('could not find PARTIAL_CLIENT_NEEDS in providers.tsx')
	const openIndex = text.indexOf('{', nameIndex)
	const body = sliceBalanced(text, openIndex, '{', '}')

	const rules = {}
	for (const entry of body.matchAll(/([A-Za-z0-9_$]+)\s*:\s*(\[[^\]]*\])/g)) {
		rules[entry[1]] = [...entry[2].matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2])
	}
	return rules
}

function applyTrim(messages, serverOnly, partial) {
	const out = { ...messages }
	for (const namespace of serverOnly) delete out[namespace]
	for (const [namespace, keep] of Object.entries(partial)) {
		const source = messages[namespace]
		if (!source || typeof source !== 'object') continue
		const trimmed = {}
		for (const leaf of keep) {
			if (leaf in source) trimmed[leaf] = source[leaf]
		}
		out[namespace] = trimmed
	}
	return out
}

function resolves(messages, dottedPath) {
	let current = messages
	for (const part of dottedPath.split('.')) {
		if (!current || typeof current !== 'object' || !(part in current)) return false
		current = current[part]
	}
	return true
}

const providersSource = fs.readFileSync(PROVIDERS, 'utf8')
const serverOnly = extractStringArray(providersSource, 'SERVER_ONLY_NAMESPACES')
const partial = extractPartialNeeds(providersSource)

console.log('rules read from providers.tsx:')
console.log('  dropped entirely :', serverOnly.join(', ') || '(none)')
for (const [namespace, keep] of Object.entries(partial)) {
	console.log(`  trimmed to leaf  : ${namespace} -> ${keep.join(', ')}`)
}
console.log()

const files = readSourceFiles(path.join(ROOT, 'src'))
const sources = new Map()
for (const file of files) sources.set(relative(file), fs.readFileSync(file, 'utf8'))

function resolveImport(from, specifier) {
	if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return null
	const base = specifier.startsWith('@/')
		? `src/${specifier.slice(2)}`
		: path.posix.join(path.posix.dirname(from), specifier)
	for (const candidate of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`, base]) {
		if (sources.has(candidate)) return candidate
	}
	return null
}

const clientReachable = new Set()
const queue = []
for (const [file, source] of sources) {
	if (/^\s*['"]use client['"]/.test(source)) {
		clientReachable.add(file)
		queue.push(file)
	}
}
while (queue.length > 0) {
	const current = queue.pop()
	for (const match of sources.get(current).matchAll(/from\s+['"]([^'"]+)['"]/g)) {
		const dependency = resolveImport(current, match[1])
		if (dependency && !clientReachable.has(dependency)) {
			clientReachable.add(dependency)
			queue.push(dependency)
		}
	}
}

const required = new Map()
for (const file of clientReachable) {
	for (const match of sources.get(file).matchAll(/useTranslations\(\s*['"]([^'"]+)['"]\s*\)/g)) {
		if (!required.has(match[1])) required.set(match[1], file)
	}
}

console.log(`client-reachable modules: ${clientReachable.size}`)
console.log(`namespaces they can request: ${required.size}`)
console.log()

let failures = 0
for (const locale of LOCALES) {
	const full = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), 'utf8'))
	const trimmed = applyTrim(full, serverOnly, partial)
	const missing = [...required.keys()].filter((namespace) => !resolves(trimmed, namespace))
	const before = Buffer.byteLength(JSON.stringify(full))
	const after = Buffer.byteLength(JSON.stringify(trimmed))

	const parts = [
		locale.padEnd(3),
		`${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB`,
		`${((1 - after / before) * 100).toFixed(1)}% off`,
	]
	if (missing.length > 0) {
		parts.push(`FAIL missing: ${missing.join(', ')}`)
		failures += missing.length
	}
	console.log(parts.join('  |  '))
}

console.log()
if (failures > 0) {
	console.error(`FAIL: ${failures} namespace(s) would throw MISSING_MESSAGE at runtime.`)
	process.exitCode = 1
} else {
	console.log('PASS: every namespace a client-reachable module can request survives the trim, in all 6 locales.')
}
