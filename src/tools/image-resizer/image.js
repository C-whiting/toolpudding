export const formats = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
export const MAX_DIMENSION = 8192
export const MAX_PIXELS = 24000000
const MAX_INPUT_PIXELS = 40000000
const MAX_INPUT_DIMENSION = 16384
const MAX_FILE_BYTES = 50 * 1024 * 1024

function checkInputDimensions(width, height) {
  if (width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION || width * height > MAX_INPUT_PIXELS) {
    throw new Error('This image is too large to open safely. Choose an image under 40 million pixels and 16,384 pixels per side.')
  }
}

// Inspect common image headers before decoding to avoid allocating enormous bitmaps.
function headerDimensions(bytes, format) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (format === 'png' && bytes.length >= 24) return [view.getUint32(16), view.getUint32(20)]
  if (format === 'jpg') {
    let offset = 2
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) break
      const marker = bytes[offset + 1]
      if (marker === 255) { offset++; continue }
      if (marker === 0xda || marker === 0xd9) break
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue }
      const length = view.getUint16(offset + 2)
      if (length < 2 || offset + 2 + length > bytes.length) break
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 7) {
        return [view.getUint16(offset + 7), view.getUint16(offset + 5)]
      }
      offset += 2 + length
    }
  }
  if (format === 'webp') {
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const chunk = String.fromCharCode(...bytes.slice(offset, offset + 4))
      const length = view.getUint32(offset + 4, true)
      const start = offset + 8
      if (start + length > bytes.length) break
      const uint24 = (index) => bytes[index] | (bytes[index + 1] << 8) | (bytes[index + 2] << 16)
      if (chunk === 'VP8X' && length >= 10) return [1 + uint24(start + 4), 1 + uint24(start + 7)]
      if (chunk === 'VP8 ' && length >= 10 && bytes[start + 3] === 0x9d && bytes[start + 4] === 0x01 && bytes[start + 5] === 0x2a) return [view.getUint16(start + 6, true) & 0x3fff, view.getUint16(start + 8, true) & 0x3fff]
      if (chunk === 'VP8L' && length >= 5 && bytes[start] === 0x2f) {
        const bits = view.getUint32(start + 1, true)
        return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1]
      }
      offset = start + length + (length % 2)
    }
  }
  return null
}

export function initialDimensions(source) {
  const scale = Math.min(1, MAX_DIMENSION / source.width, MAX_DIMENSION / source.height, Math.sqrt(MAX_PIXELS / (source.width * source.height)))
  return { width: Math.max(1, Math.floor(source.width * scale)), height: Math.max(1, Math.floor(source.height * scale)) }
}
export function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`
}
export async function readImage(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('This file is too large to open safely. Please choose an image smaller than 50 MB.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  let format
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) format = 'jpg'
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte)) format = 'png'
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') format = 'webp'
  if (!format) throw new Error('Please choose a JPG, PNG, or WebP image.')
  const dimensions = headerDimensions(bytes, format)
  if (dimensions) checkInputDimensions(...dimensions)
  const url = URL.createObjectURL(file)
  let timer
  try {
    const image = new Image()
    image.src = url
    await Promise.race([
      image.decode().catch(() => { throw new Error('This image could not be opened. It may be damaged. Please try another file.') }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('This image took too long to open. Please try a smaller image.')), 20000) }),
    ])
    checkInputDimensions(image.naturalWidth, image.naturalHeight)
    return { file, url, image, format, width: image.naturalWidth, height: image.naturalHeight }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  } finally {
    clearTimeout(timer)
  }
}
export async function resizeImage(source, width, height, format, quality) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_DIMENSION || height > MAX_DIMENSION || width * height > MAX_PIXELS) {
    throw new Error('These dimensions are too large. Try a smaller width or height.')
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Your browser could not create an image canvas.')
  if (format === 'jpg') { context.fillStyle = '#fff'; context.fillRect(0, 0, width, height) }
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source.image, 0, 0, width, height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, formats[format], quality / 100))
  if (!blob) throw new Error('Unable to resize this image. Try smaller dimensions.')
  if (blob.type !== formats[format]) throw new Error('Your browser does not support this output format. Try PNG or JPG.')
  return blob
}
