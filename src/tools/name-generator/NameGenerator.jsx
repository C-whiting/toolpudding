import { useEffect, useRef, useState } from 'react'
import { domainFor, generateNames, namingOptions } from './generator'
import { readSavedNames, STORAGE_KEY } from './storage'
import './NameGenerator.css'

const defaults = { subject: 'Website', keywords: '', vibe: 'Clean', style: 'Surprise Me', length: 'Any' }
const identity = name => name.toLowerCase().replace(/\s/g, '')

function NameCard({ item, saved, onSave, onCopy }) {
  const domain = domainFor(item.name)
  return <article className="name-card">
    <div className="name-card-top"><h3>{item.name}</h3><button className={`favorite-button ${saved ? 'is-saved' : ''}`} aria-label={`${saved ? 'Unsave' : 'Save'} ${item.name}`} aria-pressed={saved} onClick={() => onSave(item)}><span aria-hidden="true">{saved ? '\u2605' : '\u2606'}</span></button></div>
    <p className="name-domain">{domain}</p>
    <div className="name-card-actions"><button onClick={() => onCopy(item.name)} aria-label={`Copy ${item.name}`}>Copy name</button><a href={`https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`} target="_blank" rel="noopener noreferrer" aria-label={`Search domain ${domain} (opens in a new tab)`}>Search domain <span aria-hidden="true">&#8599;</span></a></div>
  </article>
}

export default function NameGenerator() {
  const [options, setOptions] = useState(defaults)
  const [results, setResults] = useState([])
  const [saved, setSaved] = useState(readSavedNames)
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState('')
  const [copyFallback, setCopyFallback] = useState('')
  const recent = useRef([])
  const resultsHeading = useRef(null)
  const savedKeys = new Set(saved.map(item => identity(item.name)))

  useEffect(() => {
    const sync = event => { if (event.key === STORAGE_KEY || event.key === null) setSaved(readSavedNames()) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function generate(event) {
    event?.preventDefault()
    const batch = generateNames(options, [...recent.current, ...saved.map(item => item.name)])
    recent.current = [...recent.current, ...batch.map(item => item.name)].slice(-600)
    setResults(batch)
    setCopyFallback('')
    setNotice(`${batch.length} fresh suggestions. Save a favorite or generate another batch.`)
    requestAnimationFrame(() => resultsHeading.current?.focus({ preventScroll: true }))
  }

  function toggleSaved(item) {
    const exists = savedKeys.has(identity(item.name))
    if (!exists && saved.length >= 200) { setNotice('Your list has 200 names. Remove one to save another.'); return }
    const next = exists ? saved.filter(name => identity(name.name) !== identity(item.name)) : [...saved, { name: item.name }]
    setSaved(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setStorageError('')
    } catch {
      setStorageError('Browser storage is unavailable. Your saved names will last only while this tool is open. Copy any favorites before leaving.')
    }
    setNotice(`${item.name} ${exists ? 'removed from' : 'added to'} saved names.`)
  }

  async function copy(name) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(name)
      setCopyFallback('')
      setNotice(`Copied ${name}.`)
    } catch {
      setCopyFallback(name)
      setNotice('Clipboard access is unavailable. Select and copy the name below.')
    }
  }

  function preset() {
    setOptions({ subject: 'Website', keywords: 'simple, useful, tools, quick', vibe: 'Playful', style: 'Surprise Me', length: 'Short' })
    setNotice('Site preset loaded: simple, useful, tools, quick. Generate names when you are ready.')
  }

  return <div className="name-generator">
    <section className="intro"><span className="eyebrow">A FRESH START FOR YOUR NEXT IDEA</span><h1>Name Generator<span>.</span></h1><p>For websites, apps, businesses, and whatever comes next.<br />Find a little inspiration. Keep the names you love.</p><div className="privacy-badge"><span aria-hidden="true">&#10003;</span> Generated on your device. No AI, no uploads.</div></section>
    <section className="panel generator-settings" aria-labelledby="generator-settings-title">
      <div className="generator-heading"><div><h2 id="generator-settings-title">Give your idea a direction</h2><p>A few clues go a long way.</p></div><button type="button" className="subtle-button site-preset" onClick={preset}>Name This Site <span aria-hidden="true">&#10024;</span></button></div>
      <form onSubmit={generate}>
        <div className="generator-fields">
          <label>What are you naming?<select aria-label="What are you naming?" value={options.subject} onChange={event => setOptions({ ...options, subject: event.target.value })}>{namingOptions.subject.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="keywords-field">Keywords <span className="optional">optional</span><input aria-label="Keywords" type="text" maxLength="240" value={options.keywords} placeholder="tools, simple, useful" onChange={event => setOptions({ ...options, keywords: event.target.value })} aria-describedby="keyword-hint" /><span id="keyword-hint" className="field-hint">Separate words with commas or spaces. They guide the ideas, not every name.</span></label>
          <label>Vibe<select aria-label="Vibe" value={options.vibe} onChange={event => setOptions({ ...options, vibe: event.target.value })}>{namingOptions.vibe.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Name style<select aria-label="Name style" value={options.style} onChange={event => setOptions({ ...options, style: event.target.value })}>{namingOptions.style.map(value => <option key={value}>{value}</option>)}</select></label>
          <label>Length preference<select aria-label="Length preference" value={options.length} onChange={event => setOptions({ ...options, length: event.target.value })}>{namingOptions.length.map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
        <div className="generator-submit"><p>Curated words, thoughtful combinations, and a bit of serendipity.</p><button className="primary" type="submit">{results.length ? 'Generate More' : 'Generate names'} <span aria-hidden="true">&#8594;</span></button></div>
      </form>
    </section>
    <div className="generator-notices"><p role="status" aria-live="polite">{notice}</p>{storageError && <p className="error" role="alert">{storageError}</p>}{copyFallback && <label className="copy-fallback">Copy this name<input readOnly value={copyFallback} onFocus={event => event.target.select()} /></label>}</div>
    <section className="name-results" aria-labelledby="results-title"><div className="results-heading"><h2 id="results-title" ref={resultsHeading} tabIndex="-1">Your next big idea <span className="count-badge">{results.length}</span></h2>{results.length > 0 && <button className="text-button" onClick={() => { setResults([]); setNotice('Results cleared. Your saved names are still here.'); setCopyFallback('') }}>Clear Results</button>}</div>
      {results.length ? <div className="name-grid">{results.map(item => <NameCard key={item.name} item={item} saved={savedKeys.has(identity(item.name))} onSave={toggleSaved} onCopy={copy} />)}</div> : <div className="names-empty"><span aria-hidden="true">&#10022;</span><h3>A good name starts somewhere.</h3><p>Choose your direction above and generate 12 suggestions.</p></div>}
      {results.length > 0 && <div className="generate-again"><button className="subtle-button" onClick={generate}>Generate More <span aria-hidden="true">&#8635;</span></button><p>A new batch each time. Your favorites stay put.</p></div>}
    </section>
    <section className="saved-names" aria-labelledby="saved-title"><div className="results-heading"><h2 id="saved-title">Saved Names <span className="count-badge">{saved.length}</span></h2><span className="saved-note">Saved in this browser</span></div>{saved.length ? <div className="name-grid">{saved.map(item => <NameCard key={item.name} item={item} saved onSave={toggleSaved} onCopy={copy} />)}</div> : <p className="saved-empty">See something you like? Tap the star to keep it here, even after a refresh.</p>}</section>
    <p className="domain-disclaimer">Names are starting points, not ownership checks. Domain availability is not checked. Search links open a registrar in a new tab; check domains and trademarks before choosing a name.</p>
  </div>
}
