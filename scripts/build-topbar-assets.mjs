#!/usr/bin/env node
/**
 * build-topbar-assets.mjs
 *
 * Generates trimmed production copies of the canonical brand PNGs for the
 * topbar logo slot. The exact supplied artwork is never redrawn or traced —
 * only transparent excess canvas is removed, and (for the dark variant) the
 * wordmark colours are adapted to the documented dark-theme tokens.
 *
 * Outputs (into frontend/src/assets/brand/):
 *   storepilot-logo-topbar.png       – light theme: exact artwork, trimmed
 *   storepilot-logo-topbar-dark.png  – dark theme: trimmed, "Store" lightened
 *                                      to #e7eaf2, "Pilot" + icon purple
 *                                      re-tinted to dark-theme primary #6366f1
 *   storepilot-mark-topbar.png       – standalone mark, trimmed (both themes)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import zlib from 'node:zlib'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const BRAND = join(ROOT, 'frontend', 'src', 'assets', 'brand')

/* Dark-theme brand tokens (variables.css) */
const LIGHT_TEXT = [231, 234, 242] // --text light: #e7eaf2
const DARK_PRIMARY = [99, 102, 241] // --primary dark: #6366f1

/* Icon content ends around x=249; column x=250 is empty. Everything at
   x >= WORDMARK_START is the "StorePilot" wordmark. */
const WORDMARK_START = 251

/* --- PNG decode (RGBA, straight alpha) --- */
function decodePng(filePath) {
  const buf = readFileSync(filePath)
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  const bitDepth = buf[24]
  const colorType = buf[25]
  const bpp = [null, 1, 3, 1, 2, null, 4][colorType] || 4

  let idat = Buffer.alloc(0)
  let pos = 8
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.slice(pos + 4, pos + 8).toString('ascii')
    if (type === 'IDAT') idat = Buffer.concat([idat, buf.slice(pos + 8, pos + 8 + len)])
    pos += 12 + len
  }

  const src = zlib.inflateSync(idat)
  const rgba = Buffer.alloc(width * height * 4)
  const prev = Buffer.alloc(width * bpp)
  let sp = 0
  for (let y = 0; y < height; y++) {
    const f = src[sp++]
    const row = Buffer.from(src.slice(sp, sp + width * bpp))
    sp += width * bpp
    const outRow = Buffer.alloc(width * bpp)
    for (let x = 0; x < width * bpp; x++) {
      const a = row[x]
      const left = x >= bpp ? outRow[x - bpp] : 0
      const up = prev[x]
      const upleft = x >= bpp ? prev[x - bpp] : 0
      let val
      if (f === 1) val = (a + left) & 255
      else if (f === 2) val = (a + up) & 255
      else if (f === 3) val = (a + ((left + up) >> 1)) & 255
      else if (f === 4) {
        const p = left + up - upleft
        const pa = Math.abs(p - left)
        const pb = Math.abs(p - up)
        const pc = Math.abs(p - upleft)
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upleft
        val = (a + pr) & 255
      } else val = a
      outRow[x] = val
      rgba[y * width * 4 + x] = val
    }
    prev.set(outRow)
  }
  return { width, height, rgba }
}

/* --- PNG encode (colorType 6, 8-bit, filter 0 per scanline) --- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colorType RGBA
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0 // filter: None
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

/* --- Bounds of non-transparent artwork (alpha above threshold) --- */
function artBounds(width, height, rgba, threshold) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return { minX, minY, maxX, maxY }
}

function crop(width, height, rgba, b) {
  const w = b.maxX - b.minX + 1
  const h = b.maxY - b.minY + 1
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((b.minY + y) * width + (b.minX + x)) * 4
      const di = (y * w + x) * 4
      out[di] = rgba[si]
      out[di + 1] = rgba[si + 1]
      out[di + 2] = rgba[si + 2]
      out[di + 3] = rgba[si + 3]
    }
  }
  return { width: w, height: h, rgba: out }
}

function fillRatio(width, height, rgba) {
  let filled = 0
  for (let i = 0; i < width * height; i++) if (rgba[i * 4 + 3] > 8) filled++
  return (filled / (width * height) * 100).toFixed(1)
}

/* --- Dark-theme recolor. Geometry untouched; only colour changes. --- */
function toDarkVariant(width, height, rgba) {
  const out = Buffer.from(rgba)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const a = out[i + 3]
      if (a <= 8) continue
      const r = out[i]
      const g = out[i + 1]
      const b = out[i + 2]
      const isPurple = b > r + 40 && b > g + 20
      if (x >= WORDMARK_START) {
        // Wordmark: "Store" (charcoal gray) → light text; "Pilot" (purple) → dark primary
        const [cr, cg, cb] = isPurple ? DARK_PRIMARY : LIGHT_TEXT
        out[i] = cr
        out[i + 1] = cg
        out[i + 2] = cb
      } else if (isPurple) {
        // Icon body: purple → dark primary (white window cutouts untouched)
        out[i] = DARK_PRIMARY[0]
        out[i + 1] = DARK_PRIMARY[1]
        out[i + 2] = DARK_PRIMARY[2]
      }
    }
  }
  return out
}

/* --- Build --- */
const logo = decodePng(join(BRAND, 'storepilot-logo-exact.png'))
const mark = decodePng(join(BRAND, 'storepilot-mark-exact.png'))

const logoBounds8 = artBounds(logo.width, logo.height, logo.rgba, 8)
const logoBounds1 = artBounds(logo.width, logo.height, logo.rgba, 1)
const markBounds8 = artBounds(mark.width, mark.height, mark.rgba, 8)
const markBounds1 = artBounds(mark.width, mark.height, mark.rgba, 1)

console.log(`logo source ${logo.width}x${logo.height} fill ${fillRatio(logo.width, logo.height, logo.rgba)}%`)
console.log(`  bounds@a>1 : x[${logoBounds1.minX}-${logoBounds1.maxX}] y[${logoBounds1.minY}-${logoBounds1.maxY}]`)
console.log(`  bounds@a>8 : x[${logoBounds8.minX}-${logoBounds8.maxX}] y[${logoBounds8.minY}-${logoBounds8.maxY}]`)
console.log(`mark source ${mark.width}x${mark.height} fill ${fillRatio(mark.width, mark.height, mark.rgba)}%`)
console.log(`  bounds@a>1 : x[${markBounds1.minX}-${markBounds1.maxX}] y[${markBounds1.minY}-${markBounds1.maxY}]`)
console.log(`  bounds@a>8 : x[${markBounds8.minX}-${markBounds8.maxX}] y[${markBounds8.minY}-${markBounds8.maxY}]`)

/* Use the tighter (a>8) bounds — a>1 picks up invisible 0.4% AA speckle —
   then add 1px transparent padding so scaled edges keep a soft feather. */
const PAD = 1
const trim = (b) => ({
  minX: Math.max(0, b.minX - PAD),
  minY: Math.max(0, b.minY - PAD),
  maxX: b.maxX + PAD,
  maxY: b.maxY + PAD,
})

const logoTrim = trim(logoBounds8)
const markTrim = trim(markBounds8)

const lightLogo = crop(logo.width, logo.height, logo.rgba, logoTrim)
const darkRgba = toDarkVariant(logo.width, logo.height, logo.rgba)
const darkLogo = crop(logo.width, logo.height, darkRgba, logoTrim)
const markAsset = crop(mark.width, mark.height, mark.rgba, markTrim)

const files = [
  ['storepilot-logo-topbar.png', encodePng(lightLogo.width, lightLogo.height, lightLogo.rgba)],
  ['storepilot-logo-topbar-dark.png', encodePng(darkLogo.width, darkLogo.height, darkLogo.rgba)],
  ['storepilot-mark-topbar.png', encodePng(markAsset.width, markAsset.height, markAsset.rgba)],
]

for (const [name, buf] of files) {
  writeFileSync(join(BRAND, name), buf)
  console.log(`wrote ${name} (${buf.length} bytes)`)
}

console.log('\nTrimmed dimensions:')
console.log(`  logo ${lightLogo.width}x${lightLogo.height}  fill ${fillRatio(lightLogo.width, lightLogo.height, lightLogo.rgba)}%`)
console.log(`  mark ${markAsset.width}x${markAsset.height}  fill ${fillRatio(markAsset.width, markAsset.height, markAsset.rgba)}%`)
console.log(`  dark-logo ${darkLogo.width}x${darkLogo.height} (recolored, same geometry)`)
