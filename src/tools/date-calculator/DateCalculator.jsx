import { useRef, useState } from 'react'
import { addBusinessDays, addDate, businessDaysBetween, daysBetween, localToday, parseDate, readableDate, weekday, weeksAndDays, wholeAmount } from './dateMath'
import './DateCalculator.css'

const modes = [{ key: 'shift', label: 'Add / Subtract' }, { key: 'between', label: 'Days Between' }, { key: 'business', label: 'Business Days' }]
const initialDate = () => typeof window === 'undefined' ? '' : localToday()
const dateLimits = { min: '0001-01-01', max: '9999-12-31' }

function calculate({ mode, businessMode, start, end, amount, unit, operation, includeEnd }) {
  try {
    if (!start || ((mode === 'between' || (mode === 'business' && businessMode === 'between')) && !end)) {
      return { error: 'Choose the dates to see your result.' }
    }
    const business = mode === 'business'
    const range = mode === 'between' || (business && businessMode === 'between')
    if (range) {
      const earlier = parseDate(start) <= parseDate(end) ? start : end
      const later = earlier === start ? end : start
      const count = business ? businessDaysBetween(start, end, includeEnd) : daysBetween(start, end, includeEnd)
      return {
        title: `${count.toLocaleString()} ${business ? 'business ' : ''}${count === 1 ? 'day' : 'days'}`,
        summary: `${readableDate(earlier)} to ${readableDate(later)}`,
        detail: business ? '' : weeksAndDays(count),
        rule: `${includeEnd ? 'Both dates included.' : 'Earlier date included; later date excluded.'}${start === end ? ' Same-date ranges count as ' + (includeEnd ? 'one date' : 'zero days') + (business ? ' if it is a weekday.' : '.') : ''}${parseDate(start) > parseDate(end) ? ' Dates were entered in reverse; counting from earlier to later.' : ''}`,
      }
    }
    const value = wholeAmount(amount)
    const result = business ? addBusinessDays(start, value, operation) : addDate(start, value, unit, operation)
    const noun = business ? 'business day' : unit.slice(0, -1)
    return {
      title: readableDate(result),
      summary: `${value.toLocaleString()} ${noun}${value === 1 ? '' : 's'} ${operation === 'subtract' ? 'before' : 'after'} ${readableDate(start)}`,
      detail: `${weekday(result)}${!business && (unit === 'days' || unit === 'weeks') ? ` · ${weeksAndDays(value * (unit === 'weeks' ? 7 : 1))}` : ''}`,
      rule: business ? 'Starting date excluded. Count begins on the next weekday in the chosen direction. Zero keeps the starting date.' : (unit === 'months' || unit === 'years') ? 'If the target month has no matching day, the result uses its last day.' : 'Starting date excluded. Zero keeps the starting date.',
    }
  } catch (error) {
    return { error: error.message }
  }
}

export default function DateCalculator() {
  const [mode, setMode] = useState('shift')
  const [businessMode, setBusinessMode] = useState('shift')
  const [start, setStart] = useState(initialDate)
  const [end, setEnd] = useState(initialDate)
  const [amount, setAmount] = useState('90')
  const [unit, setUnit] = useState('days')
  const [operation, setOperation] = useState('add')
  const [includeEnd, setIncludeEnd] = useState(false)
  const [notice, setNotice] = useState('')
  const [copyFallback, setCopyFallback] = useState('')
  const tabRefs = useRef([])
  const business = mode === 'business'
  const range = mode === 'between' || (business && businessMode === 'between')
  const result = calculate({ mode, businessMode, start, end, amount, unit, operation, includeEnd })
  const copyText = result.error ? '' : [result.title, result.summary, result.detail, result.rule, business ? 'Business days exclude weekends. Holidays are not excluded.' : ''].filter(Boolean).join('\n')

  function update(setter, value) {
    setter(value)
    setNotice('')
    setCopyFallback('')
  }

  function changeTab(index) {
    update(setMode, modes[index].key)
    tabRefs.current[index]?.focus()
  }

  function tabKey(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % modes.length : event.key === 'ArrowLeft' ? (index + modes.length - 1) % modes.length : event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1 : null
    if (next !== null) { event.preventDefault(); changeTab(next) }
  }

  async function copyResult() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(copyText)
      setNotice('Result copied.')
      setCopyFallback('')
    } catch {
      setCopyFallback(copyText)
      setNotice('Clipboard access is unavailable. Select and copy the result below.')
    }
  }

  function reset() {
    setStart(localToday())
    setEnd(localToday())
    setAmount('90')
    setUnit('days')
    setOperation('add')
    setIncludeEnd(false)
    setBusinessMode('shift')
    setCopyFallback('')
    setNotice('Reset to today and the default settings.')
  }

  return <div className="date-page">
    <section className="intro"><span className="eyebrow">A LITTLE HELP WITH THE CALENDAR</span><h1>Date Calculator<span aria-hidden="true">.</span></h1><p>Add days, count the gap, or skip the weekends.</p><div className="privacy-badge"><span aria-hidden="true">&#10003;</span> Calculated on your device. No account needed.</div></section>
    <section className="panel date-calculator" aria-label="Date calculator">
      <div className="date-tabs" role="tablist" aria-label="Calculation mode">{modes.map((item, index) => <button key={item.key} ref={element => { tabRefs.current[index] = element }} id={`date-tab-${item.key}`} role="tab" aria-selected={mode === item.key} aria-controls={`date-panel-${item.key}`} tabIndex={mode === item.key ? 0 : -1} onClick={() => update(setMode, item.key)} onKeyDown={event => tabKey(event, index)}>{item.label}</button>)}</div>
      {modes.map(item => <div key={item.key} id={`date-panel-${item.key}`} role="tabpanel" aria-labelledby={`date-tab-${item.key}`} hidden={mode !== item.key}>{mode === item.key && <>
        {business && <label className="date-business-mode">Calculate<select aria-label="Calculate" value={businessMode} onChange={event => update(setBusinessMode, event.target.value)}><option value="shift">Add / subtract business days</option><option value="between">Business days between dates</option></select></label>}
        <div className="date-fields">
          <label>{range ? 'Start date' : 'Starting date'}<input type="date" {...dateLimits} required value={start} onChange={event => update(setStart, event.target.value)} /></label>
          {range ? <label>End date<input type="date" {...dateLimits} required value={end} onChange={event => update(setEnd, event.target.value)} /></label> : <>
            <label>Amount<input type="number" min="0" step="1" inputMode="numeric" required value={amount} onChange={event => update(setAmount, event.target.value)} aria-describedby="date-amount-hint" /></label>
            {!business && <label>Unit<select aria-label="Unit" value={unit} onChange={event => update(setUnit, event.target.value)}>{['days', 'weeks', 'months', 'years'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>}
            <label>Operation<select aria-label="Operation" value={operation} onChange={event => update(setOperation, event.target.value)}><option value="add">Add</option><option value="subtract">Subtract</option></select></label>
          </>}
        </div>
        {range ? <><label className="date-inclusive"><input type="checkbox" checked={includeEnd} onChange={event => update(setIncludeEnd, event.target.checked)} /> Include end date (the later date)</label><p className="date-hint">Counts from earlier to later, even if the dates are entered in reverse. The earlier date is included; the later date is {includeEnd ? 'included too' : 'excluded'}.</p></> : <p className="date-hint" id="date-amount-hint">Use a non-negative whole number. {business ? 'The starting date is not counted; only weekdays after or before it count.' : 'The starting date is not counted. Choose Subtract to go back.'}</p>}
        {business && <p className="date-holiday-note">Business days exclude weekends. Holidays are not excluded.</p>}
        <div className="date-result" role="status" aria-live="polite" aria-atomic="true">{result.error ? <p className="date-hint">{result.error}</p> : <><h2>{result.title}</h2><p className="date-result-summary">{result.summary}</p>{result.detail && <p className="date-result-detail">{result.detail}</p>}<p className="date-hint">{result.rule}</p></>}</div>
        <div className="date-actions"><button className="primary" disabled={!!result.error} onClick={copyResult}>Copy Result</button><button className="date-reset" onClick={reset}>Reset</button></div>
      </>}</div>)}
      <p className="date-copy-notice" role="status">{notice}</p>
      {copyFallback && <label className="date-copy-fallback">Copy this result<textarea aria-label="Copy this result" readOnly value={copyFallback} onFocus={event => event.target.select()} /></label>}
    </section>
  </div>
}
