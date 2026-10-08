const DAY = 86400000

// UTC is only a timezone-neutral calendar workspace here, never a user's instant.
// Parse numeric parts instead of new Date('YYYY-MM-DD'), and never use local
// timestamps for elapsed days: DST can make a local day 23 or 25 hours long.
function calendar(year, month, day) {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

export function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error('Choose a valid date from year 0001 to 9999.')
  const [, year, month, day] = match.map(Number)
  const date = calendar(year, month, day)
  if (year < 1 || year > 9999 || date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new Error('Choose a valid date from year 0001 to 9999.')
  }
  return date.getTime() / DAY
}

export function dateString(serial) {
  const date = new Date(serial * DAY)
  const year = date.getUTCFullYear()
  if (!Number.isInteger(serial) || !Number.isFinite(date.getTime()) || year < 1 || year > 9999) {
    throw new Error('The result is outside year 0001 to 9999. Try a smaller amount.')
  }
  return `${String(year).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function localToday(now = new Date()) {
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function readableDate(value) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(parseDate(value) * DAY))
}

export function weekday(value) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(new Date(parseDate(value) * DAY))
}

export function wholeAmount(value) {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value))) throw new Error('Enter a non-negative whole number for the amount.')
  return Number(value)
}

export function addDate(value, amount, unit, operation = 'add') {
  const serial = parseDate(value)
  const delta = wholeAmount(amount) * (operation === 'subtract' ? -1 : 1)
  if (unit === 'days' || unit === 'weeks') return dateString(serial + delta * (unit === 'weeks' ? 7 : 1))
  const source = new Date(serial * DAY)
  const months = source.getUTCFullYear() * 12 + source.getUTCMonth() + delta * (unit === 'years' ? 12 : 1)
  const year = Math.floor(months / 12)
  const month = ((months % 12) + 12) % 12 + 1
  if (year < 1 || year > 9999) throw new Error('The result is outside year 0001 to 9999. Try a smaller amount.')
  const lastDay = calendar(year, month + 1, 0).getUTCDate()
  return dateString(calendar(year, month, Math.min(source.getUTCDate(), lastDay)).getTime() / DAY)
}

const dayOfWeek = serial => ((serial + 4) % 7 + 7) % 7
const isBusinessDay = serial => dayOfWeek(serial) !== 0 && dayOfWeek(serial) !== 6

export function addBusinessDays(value, amount, operation = 'add') {
  let serial = parseDate(value)
  let remaining = wholeAmount(amount)
  const direction = operation === 'subtract' ? -1 : 1
  // Exclude the starting date. Reach a weekday before skipping whole weeks.
  while (remaining > 0 && !isBusinessDay(serial)) {
    serial += direction
    if (isBusinessDay(serial)) remaining--
  }
  const weeks = Math.floor(remaining / 5)
  serial += direction * weeks * 7
  remaining %= 5
  while (remaining > 0) {
    serial += direction
    if (isBusinessDay(serial)) remaining--
  }
  return dateString(serial)
}

export function daysBetween(start, end, includeEnd = false) {
  return Math.abs(parseDate(end) - parseDate(start)) + (includeEnd ? 1 : 0)
}

export function businessDaysBetween(start, end, includeEnd = false) {
  const first = parseDate(start)
  const second = parseDate(end)
  const lower = Math.min(first, second)
  const upper = Math.max(first, second)
  const length = upper - lower + (includeEnd ? 1 : 0)
  let count = Math.floor(length / 7) * 5
  for (let offset = Math.floor(length / 7) * 7; offset < length; offset++) {
    if (isBusinessDay(lower + offset)) count++
  }
  return count
}

export function weeksAndDays(days) {
  const weeks = Math.floor(days / 7)
  const remainder = days % 7
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} + ${remainder} ${remainder === 1 ? 'day' : 'days'}`
}
