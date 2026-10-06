import { MAX_CHOICES, SAMPLE_CHOICES, shuffleChoices } from './wheelLogic'

export default function ChoiceEditor({ text, choices, spinning, onChange, onCopy }) {
  const duplicates = choices.length - new Set(choices.map(choice => choice.label.toLocaleLowerCase())).size
  const labels = choices.map(choice => choice.label)
  return <section className="panel choice-editor" aria-labelledby="choice-title">
    <div className="panel-heading"><h2 id="choice-title">What goes on the wheel?</h2><span className="count-badge">{choices.length}</span></div>
    <label htmlFor="wheel-choices">Your choices</label><p id="choices-hint">One choice per line. Blank lines are ignored.</p>
    <textarea id="wheel-choices" value={text} maxLength={60000} disabled={spinning} onChange={event => onChange(event.target.value)} aria-describedby="choices-hint choices-limit" spellCheck="false" />
    <p id="choices-limit" className={choices.length > MAX_CHOICES || choices.length < 2 ? 'wheel-validation' : 'wheel-editor-note'}>{choices.length > MAX_CHOICES ? `You have ${choices.length} choices. Keep 100 or fewer to spin.` : choices.length < 2 ? 'Add at least two choices to spin.' : duplicates ? `${duplicates} duplicate ${duplicates === 1 ? 'entry' : 'entries'}. Each line gets its own equal chance.` : 'Each choice gets an equal chance.'}</p>
    <div className="choice-actions">
      <button disabled={spinning || choices.length < 2} onClick={() => onChange(shuffleChoices(labels).join('\n'))}>Shuffle choices</button>
      <button disabled={spinning || choices.length < 2} onClick={() => onChange([...labels].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })).join('\n'))}>Sort A-Z</button>
      <button disabled={spinning || !duplicates} onClick={() => { const seen = new Set(); onChange(labels.filter(label => { const key = label.toLocaleLowerCase(); if (seen.has(key)) return false; seen.add(key); return true }).join('\n')) }}>Remove duplicates</button>
      <button disabled={spinning || !choices.length} onClick={onCopy}>Copy List</button>
      <button disabled={spinning || !text} onClick={() => onChange('')}>Clear all</button>
      <button disabled={spinning} onClick={() => onChange(SAMPLE_CHOICES)}>Reset / sample choices</button>
    </div>
    <p className="wheel-editor-note">Your list is saved in this browser. For long lists, segment numbers match the order of nonblank choices.</p>
  </section>
}
