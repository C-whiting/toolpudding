import { useEffect, useMemo, useRef, useState } from 'react'
import ChoiceEditor from './ChoiceEditor'
import Wheel from './Wheel'
import WinnerResult from './WinnerResult'
import { createSpin, easeSpin, MAX_CHOICES, normalizeRotation, parseChoices, readChoices, STORAGE_KEY, winnerAtRotation } from './wheelLogic'
import { createWheelSound } from './sound'
import './SpinWheel.css'

export default function SpinWheel() {
  const [text, setText] = useState(readChoices)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [lastWinner, setLastWinner] = useState('')
  const [soundOn, setSoundOn] = useState(false)
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState('')
  const [copyFallback, setCopyFallback] = useState(false)
  const choices = useMemo(() => parseChoices(text), [text])
  const visibleChoices = useMemo(() => choices.slice(0, MAX_CHOICES), [choices])
  const frame = useRef(null)
  const running = useRef(false)
  const sound = useRef(null)
  const soundEnabled = useRef(false)
  const spinControl = useRef(null)
  const canSpin = choices.length >= 2 && choices.length <= MAX_CHOICES
  useEffect(() => () => { cancelAnimationFrame(frame.current); sound.current?.close() }, [])

  function changeList(value) {
    if (running.current) return
    setText(value)
    setRotation(0)
    setWinner(null)
    setLastWinner('')
    setCopyFallback(false)
    setNotice('')
    try { localStorage.setItem(STORAGE_KEY, value); setStorageError('') }
    catch { setStorageError('Browser storage is unavailable. Copy your list before leaving or refreshing.') }
  }

  function restoreFocus() {
    requestAnimationFrame(() => {
      const element = spinControl.current?.disabled ? document.getElementById('wheel-choices') : spinControl.current
      element?.focus({ preventScroll: true })
    })
  }

  function closeWinner() { setWinner(null); restoreFocus() }

  function spin() {
    if (running.current || !canSpin) return
    let target
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    try { target = createSpin(rotation, choices.length, reduced) }
    catch { setNotice('Your browser could not generate a random spin. Please try again.'); return }
    running.current = true
    setSpinning(true)
    setWinner(null)
    setLastWinner('')
    setNotice('Spinning. Every entry has an equal chance.')
    if (soundEnabled.current) { sound.current ||= createWheelSound(); sound.current?.resume() }
    const startRotation = rotation
    let startTime
    let lastSegment = winnerAtRotation(rotation, choices.length)
    const finish = () => {
      const finalRotation = normalizeRotation(target.rotation)
      const index = winnerAtRotation(finalRotation, choices.length)
      setRotation(finalRotation)
      setWinner(choices[index])
      setLastWinner(choices[index].label)
      setSpinning(false)
      running.current = false
      setNotice(`Winner: ${choices[index].label}`)
      if (soundEnabled.current) sound.current?.winner()
    }
    if (!target.duration) { finish(); return }
    const animate = timestamp => {
      startTime ??= timestamp
      const progress = Math.min(1, (timestamp - startTime) / target.duration)
      const angle = startRotation + (target.rotation - startRotation) * easeSpin(progress)
      setRotation(angle)
      const segment = winnerAtRotation(angle, choices.length)
      if (segment !== lastSegment && soundEnabled.current) sound.current?.tick()
      lastSegment = segment
      if (progress < 1) frame.current = requestAnimationFrame(animate)
      else finish()
    }
    frame.current = requestAnimationFrame(animate)
  }

  function removeWinner() {
    const remaining = text.split(/\r?\n/).filter((_, index) => index !== winner.lineIndex).join('\n')
    const label = winner.label
    changeList(remaining)
    setNotice(`Removed ${label}. ${parseChoices(remaining).length} choices remain.`)
    restoreFocus()
  }

  async function copyList() {
    try { await navigator.clipboard.writeText(choices.map(choice => choice.label).join('\n')); setCopyFallback(false); setNotice('List copied.') }
    catch { setCopyFallback(true); setNotice('Clipboard access is unavailable. Select and copy your list below.') }
  }

  return <div className="spin-page">
    <section className="intro"><span className="eyebrow">LET A LITTLE CHANCE DECIDE</span><h1>Spin the Wheel<span aria-hidden="true">.</span></h1><p>Add your choices. Give it a spin. Let the wheel pick.</p><div className="privacy-badge"><span aria-hidden="true">&#10003;</span> Free. No account. Your list stays in your browser.</div></section>
    <div className="spin-layout"><section className="panel wheel-panel" aria-label="Random choice wheel">
      <div className="wheel-toolbar"><span>{choices.length} choices</span><label><input type="checkbox" checked={soundOn} onChange={event => { setSoundOn(event.target.checked); soundEnabled.current = event.target.checked }} />Sound {soundOn ? 'on' : 'off'}</label></div>
      <Wheel choices={visibleChoices} rotation={rotation} spinning={spinning} disabled={!canSpin} onSpin={spin} />
      <button ref={spinControl} className="primary spin-button" disabled={spinning || !canSpin} onClick={spin}>{spinning ? 'SPINNING…' : 'SPIN'} <span aria-hidden="true">&#8635;</span></button>
      <p className="wheel-tip">Tap the wheel or use the button. Space and Enter work too.</p>
      <p className="wheel-last-result" aria-live="polite">{lastWinner ? <>Selected: <strong>{lastWinner}</strong></> : spinning ? 'A few turns, one decision…' : 'Ready when you are.'}</p>
    </section><ChoiceEditor text={text} choices={choices} spinning={spinning} onChange={changeList} onCopy={copyList} /></div>
    <div className="wheel-notices"><p role="status">{notice}</p>{storageError && <p className="error" role="alert">{storageError}</p>}{copyFallback && <label>Copy your list<textarea readOnly value={choices.map(choice => choice.label).join('\n')} onFocus={event => event.target.select()} /></label>}</div>
    {winner && <WinnerResult winner={winner} onAgain={spin} onRemove={removeWinner} onClose={closeWinner} canSpin={canSpin} />}
    <section className="wheel-uses"><h2>For the decisions that need a little nudge</h2><p>Pick what to eat, choose a classroom activity, settle a game, or decide between a few good options. Use it for giveaways and drawings, too: remove each winner to pick the next without repeats.</p><p>Every line gets an equal chance, using your browser’s cryptographic randomness. No list uploads, no signup, no waiting around.</p></section>
  </div>
}
