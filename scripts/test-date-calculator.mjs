import assert from 'node:assert/strict'
import test from 'node:test'
import { addBusinessDays, addDate, businessDaysBetween, dateString, daysBetween, localToday, parseDate, readableDate, weekday, weeksAndDays } from '../src/tools/date-calculator/dateMath.js'

test('days and weeks cross month and year boundaries', () => {
  assert.equal(addDate('2026-10-06', 90, 'days'), '2027-01-04')
  assert.equal(addDate('2026-01-10', 30, 'days', 'subtract'), '2025-12-11')
  assert.equal(addDate('2026-01-31', 1, 'days'), '2026-02-01')
  assert.equal(addDate('2026-12-28', 1, 'weeks'), '2027-01-04')
  assert.equal(addDate('2026-10-08', 0, 'days'), '2026-10-08')
})

test('February respects leap years, including century rules', () => {
  for (const year of ['2024', '2000']) {
    assert.equal(addDate(`${year}-02-28`, 1, 'days'), `${year}-02-29`)
    assert.equal(addDate(`${year}-02-29`, 1, 'days'), `${year}-03-01`)
  }
  for (const year of ['2026', '1900', '2100']) assert.equal(addDate(`${year}-02-28`, 1, 'days'), `${year}-03-01`)
  assert.equal(addDate('2024-03-01', 1, 'days', 'subtract'), '2024-02-29')
})

test('month and year shifts clamp once to the target month', () => {
  assert.equal(addDate('2026-01-31', 1, 'months'), '2026-02-28')
  assert.equal(addDate('2024-01-31', 1, 'months'), '2024-02-29')
  assert.equal(addDate('2026-01-31', 2, 'months'), '2026-03-31')
  assert.equal(addDate('2026-03-31', 1, 'months', 'subtract'), '2026-02-28')
  assert.equal(addDate('2024-02-29', 1, 'years'), '2025-02-28')
  assert.equal(addDate('2024-02-29', 1, 'years', 'subtract'), '2023-02-28')
  assert.equal(addDate('2024-02-29', 4, 'years'), '2028-02-29')
  assert.equal(addDate('2026-12-31', 2, 'months'), '2027-02-28')
})

test('ranges are non-negative and end inclusion adds exactly one calendar date', () => {
  assert.equal(daysBetween('2026-10-06', '2027-01-04'), 90)
  assert.equal(daysBetween('2027-01-04', '2026-10-06'), 90)
  assert.equal(daysBetween('2027-01-04', '2026-10-06', true), 91)
  assert.equal(daysBetween('2024-02-28', '2024-03-01'), 2)
  assert.equal(daysBetween('2026-02-28', '2026-03-01'), 1)
  assert.equal(daysBetween('2026-10-08', '2026-10-08'), 0)
  assert.equal(daysBetween('2026-10-08', '2026-10-08', true), 1)
  assert.equal(weeksAndDays(90), '12 weeks + 6 days')
})

test('business shifts exclude the start and skip weekends in both directions', () => {
  assert.equal(addBusinessDays('2026-10-09', 1), '2026-10-12') // Friday
  assert.equal(addBusinessDays('2026-10-12', 1, 'subtract'), '2026-10-09')
  for (const weekend of ['2026-10-10', '2026-10-11']) {
    assert.equal(addBusinessDays(weekend, 1), '2026-10-12')
    assert.equal(addBusinessDays(weekend, 1, 'subtract'), '2026-10-09')
    assert.equal(addBusinessDays(weekend, 5), '2026-10-16')
    assert.equal(addBusinessDays(weekend, 0), weekend)
  }
  assert.equal(addBusinessDays('2026-10-08', 20), '2026-11-05')
  assert.equal(addBusinessDays('2026-12-24', 1), '2026-12-25') // Holidays stay in
  assert.equal(addBusinessDays('2026-10-12', 100000), '2410-02-01')
  assert.equal(businessDaysBetween('2026-10-12', '2410-02-01'), 100000)
})

test('business ranges apply chronological inclusion and ignore weekend endpoints', () => {
  assert.equal(businessDaysBetween('2026-10-09', '2026-10-12'), 1)
  assert.equal(businessDaysBetween('2026-10-09', '2026-10-12', true), 2)
  assert.equal(businessDaysBetween('2026-10-12', '2026-10-09', true), 2)
  assert.equal(businessDaysBetween('2026-10-10', '2026-10-12'), 0)
  assert.equal(businessDaysBetween('2026-10-10', '2026-10-12', true), 1)
  assert.equal(businessDaysBetween('2026-10-09', '2026-10-11', true), 1)
  assert.equal(businessDaysBetween('2026-10-10', '2026-10-10', true), 0)
  assert.equal(businessDaysBetween('2026-10-12', '2026-10-12', true), 1)
  assert.equal(businessDaysBetween('2026-10-12', '2026-10-12'), 0)
})

test('optimized business arithmetic agrees with a day-by-day reference', () => {
  const base = parseDate('2026-10-05')
  const workday = serial => ![0, 6].includes(new Date(serial * 86400000).getUTCDay())
  for (let start = base; start < base + 14; start++) {
    for (const direction of [-1, 1]) {
      for (const amount of [0, 1, 4, 5, 6, 10, 20, 100, 365]) {
        let expected = start
        let remaining = amount
        while (remaining) { expected += direction; if (workday(expected)) remaining-- }
        assert.equal(addBusinessDays(dateString(start), amount, direction === 1 ? 'add' : 'subtract'), dateString(expected))
      }
    }
    for (let length = 0; length < 40; length++) {
      for (const inclusive of [false, true]) {
        let expected = 0
        for (let serial = start; serial < start + length + Number(inclusive); serial++) if (workday(serial)) expected++
        assert.equal(businessDaysBetween(dateString(start), dateString(start + length), inclusive), expected)
      }
    }
  }
})

test('calendar date parsing, display, boundaries, and invalid amounts', () => {
  assert.equal(dateString(parseDate('0001-01-01')), '0001-01-01')
  assert.equal(addDate('0099-12-31', 1, 'days'), '0100-01-01')
  assert.equal(readableDate('2027-01-04'), 'January 4, 2027')
  assert.equal(weekday('2027-01-04'), 'Monday')
  for (const invalid of ['2026-02-29', '2024-02-30', '2026-13-01', '0000-01-01', '2026-1-1', '', 'not a date']) assert.throws(() => parseDate(invalid), /valid date/)
  for (const invalid of ['', '-1', '1.5', 'Infinity', '9007199254740992']) assert.throws(() => addDate('2026-10-08', invalid, 'days'), /whole number/)
  assert.throws(() => addDate('9999-12-31', 1, 'days'), /outside/)
  assert.throws(() => addDate('0001-01-01', 1, 'days', 'subtract'), /outside/)
  assert.throws(() => addDate('9999-01-01', 1, 'years'), /outside/)
  assert.throws(() => addBusinessDays('9999-12-31', 10), /outside/)
  assert.equal(localToday(new Date(2026, 9, 8, 23, 59)), '2026-10-08')
})

test('DST transitions count calendar days, including reversed inputs', () => {
  for (const [start, end] of [['2026-03-07', '2026-03-09'], ['2026-10-31', '2026-11-02']]) {
    assert.equal(daysBetween(start, end), 2)
    assert.equal(daysBetween(end, start), 2)
    assert.equal(addDate(start, 2, 'days'), end)
    assert.equal(addDate(end, 2, 'days', 'subtract'), start)
  }
})
