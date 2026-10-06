export const MAX_CHOICES = 100
export const STORAGE_KEY = 'toolpudding.wheel-choices.v1'
export const SAMPLE_CHOICES = 'Pizza\nTacos\nPasta\nSushi\nBurgers\nSalad'

export function parseChoices(text) {
  return text.split(/\r?\n/).map((label, lineIndex) => ({ label: label.trim(), lineIndex })).filter(choice => choice.label)
}

export function randomInt(limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 0x100000000) throw new Error('Invalid random range')
  const bytes = new Uint32Array(1)
  const ceiling = Math.floor(0x100000000 / limit) * limit
  do { crypto.getRandomValues(bytes) } while (bytes[0] >= ceiling)
  return bytes[0] % limit
}

export const normalizeRotation = degrees => ((degrees % 360) + 360) % 360
export function winnerAtRotation(rotation, count) {
  if (!count) return -1
  return Math.min(count - 1, Math.floor(normalizeRotation(-rotation) / (360 / count)))
}

export function createSpin(rotation, count, reducedMotion = false) {
  const winnerIndex = randomInt(count)
  // Land well inside a segment, never on a boundary. SVG slices start at twelve o'clock.
  const position = .25 + randomInt(5001) / 10000
  const target = normalizeRotation(-(winnerIndex + position) * 360 / count)
  return {
    rotation: rotation + (reducedMotion ? 0 : (5 + randomInt(5)) * 360) + normalizeRotation(target - normalizeRotation(rotation)),
    duration: reducedMotion ? 0 : 4700 + randomInt(1801),
    winnerIndex,
  }
}

export const easeSpin = progress => progress < .5 ? 16 * progress ** 5 : 1 - (-2 * progress + 2) ** 5 / 2
export function shuffleChoices(choices) {
  const result = [...choices]
  for (let i = result.length - 1; i > 0; i--) {
    const index = randomInt(i + 1)
    ;[result[i], result[index]] = [result[index], result[i]]
  }
  return result
}

export function readChoices() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored !== null && stored.length <= 60000 ? stored : SAMPLE_CHOICES
  } catch { return SAMPLE_CHOICES }
}
