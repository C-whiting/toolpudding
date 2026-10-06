import { useEffect, useRef } from 'react'

export default function WinnerResult({ winner, onAgain, onRemove, onClose, canSpin }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  return <dialog ref={dialog} className="winner-dialog" aria-labelledby="winner-title" aria-describedby="winner-choice" onCancel={onClose}>
    <span className="winner-spark" aria-hidden="true">&#127881;</span><h2 id="winner-title">Winner</h2><p id="winner-choice">{winner.label}</p>
    <p className="winner-explainer">The wheel has spoken. The pudding has proof.</p>
    <div className="winner-actions"><button className="primary" onClick={onAgain} disabled={!canSpin} autoFocus>Spin Again</button><button className="subtle-button" onClick={onRemove}>Remove Winner</button><button className="text-button" onClick={onClose}>Close</button></div>
    <p className="wheel-editor-note">Remove Winner takes out this one entry, even if the name appears more than once.</p>
  </dialog>
}
