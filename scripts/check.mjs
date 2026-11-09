// Checks every theme in themes/ the way Kothar does before it installs one, and that its text stays readable.
// node scripts/check.mjs [files...]  (no arguments: every file in themes/). Exits 1 on any problem.
import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TOKENS = ['bg', 'panel', 'raised', 'hover', 'border', 'text', 'muted', 'faint', 'accent', 'on-accent', 'green', 'amber', 'red']
const FIELDS = ['id', 'name', 'version', 'author', 'description', 'dark', 'light']
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/
const VERSION = /^\d{1,6}\.\d{1,6}\.\d{1,6}$/
const MAX_BYTES = 64 * 1024
const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)

function onlyKeys(value, what, required, optional = []) {
  if (!isRecord(value)) throw new Error(`${what} must be an object`)
  const extra = Object.keys(value).find((k) => !required.includes(k) && !optional.includes(k))
  if (extra !== undefined) throw new Error(`${what} has an unknown field "${extra}"`)
  const missing = required.find((k) => !Object.hasOwn(value, k))
  if (missing !== undefined) throw new Error(`${what} is missing "${missing}"`)
}

function text(value, what, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f]/.test(value)) {
    throw new Error(`${what} must be text of 1 to ${max} characters`)
  }
}

// Every 3- and 4-digit colour is widened, so contrast maths reads one shape.
const wide = (hex) => (hex.length <= 5 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex)

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(wide(hex).slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function over(top, under) {
  top = wide(top)
  under = wide(under)
  const alpha = top.length === 9 ? parseInt(top.slice(7), 16) / 255 : 1
  const mix = [1, 3, 5].map((i) => {
    const v = parseInt(top.slice(i, i + 2), 16) * alpha + parseInt(under.slice(i, i + 2), 16) * (1 - alpha)
    return Math.round(v).toString(16).padStart(2, '0')
  })
  return `#${mix.join('')}`
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export function checkTheme(theme, file) {
  onlyKeys(theme, 'The theme', FIELDS, ['variants'])
  if (!ID.test(theme.id)) throw new Error('id must be lowercase letters, digits and dashes')
  if (basename(file) !== `${theme.id}.json`) throw new Error(`the file must be named ${theme.id}.json`)
  if (!VERSION.test(theme.version)) throw new Error('version must look like 1.2.3')
  text(theme.name, 'name', 40)
  text(theme.author, 'author', 60)
  text(theme.description, 'description', 200)
  if (theme.variants !== undefined) {
    onlyKeys(theme.variants, 'variants', ['dark', 'light'])
    text(theme.variants.dark, 'variants.dark', 30)
    text(theme.variants.light, 'variants.light', 30)
  }
  for (const scheme of ['dark', 'light']) {
    onlyKeys(theme[scheme], `The ${scheme} palette`, TOKENS)
    for (const token of TOKENS) {
      if (typeof theme[scheme][token] !== 'string' || !HEX.test(theme[scheme][token])) {
        throw new Error(`${scheme} ${token} must be a hex colour`)
      }
    }
    const { bg, panel, text: body, muted, faint } = theme[scheme]
    const surfaces = [bg, over(panel, bg)]
    // Body text everywhere; secondary text on light pages, as Kothar's own themes are held to.
    const read = scheme === 'light' ? { text: body, muted, faint } : { text: body }
    for (const surface of surfaces) {
      for (const [name, color] of Object.entries(read)) {
        const ratio = contrast(over(color, surface), surface)
        if (ratio < 4.5) throw new Error(`${scheme} ${name} on ${surface} is ${ratio.toFixed(2)}:1; it needs 4.5:1`)
      }
    }
  }
}

const dir = fileURLToPath(new URL('../themes/', import.meta.url))
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir).filter((n) => n.endsWith('.json')).map((n) => join(dir, n))
let failed = 0
for (const file of files) {
  try {
    const bytes = readFileSync(file)
    if (bytes.length > MAX_BYTES) throw new Error(`it is over ${MAX_BYTES} bytes`)
    checkTheme(JSON.parse(bytes.toString('utf8')), file)
    console.log(`ok   ${basename(file)}`)
  } catch (error) {
    failed++
    console.error(`FAIL ${basename(file)}: ${error.message}`)
  }
}
if (failed) process.exit(1)
