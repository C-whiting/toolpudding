import { useEffect, useRef, useState } from 'react'
import { fileSize, initialDimensions, MAX_DIMENSION, MAX_PIXELS, readImage, resizeImage } from './image'
function PictureIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 6-6 4 4 3-3 5 5" /></svg>
}
export default function ImageResizer() {
  const [source, setSource] = useState(null)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [locked, setLocked] = useState(true)
  const [format, setFormat] = useState('jpg')
  const [quality, setQuality] = useState(90)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const input = useRef(null)
  const selection = useRef(0)
  const valid = Number.isInteger(Number(width)) && Number.isInteger(Number(height)) && width > 0 && height > 0 && width <= MAX_DIMENSION && height <= MAX_DIMENSION && width * height <= MAX_PIXELS
  const key = `${width}:${height}:${format}:${quality}`
  const currentResult = result?.source === source && result?.key === key && valid ? result : null
  useEffect(() => () => { if (source) URL.revokeObjectURL(source.url) }, [source])
  useEffect(() => () => { selection.current++ }, [])
  useEffect(() => {
    if (!source || !valid) return
    let cancelled = false
    let url
    const timer = setTimeout(async () => {
      try {
        const blob = await resizeImage(source, Number(width), Number(height), format, quality)
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setResult({ url, blob, key, source })
      } catch (failure) {
        if (!cancelled) setResult({ error: failure.message, key, source })
      }
    }, 180)
    return () => { cancelled = true; clearTimeout(timer); if (url) URL.revokeObjectURL(url) }
  }, [source, width, height, format, quality, key, valid])
  async function choose(file) {
    if (!file) return
    const id = ++selection.current
    setLoading(true)
    setError('')
    try {
      const next = await readImage(file)
      if (id !== selection.current) { URL.revokeObjectURL(next.url); return }
      setSource(next)
      setWidth(String(initialDimensions(next).width))
      setHeight(String(initialDimensions(next).height))
      setFormat(next.format)
      setQuality(90)
      setLocked(true)
      setResult(null)
    } catch (failure) {
      if (id === selection.current) setError(failure.message)
    } finally {
      if (id === selection.current) setLoading(false)
    }
  }
  function changeDimension(value, dimension) {
    const setter = dimension === 'width' ? setWidth : setHeight
    setter(value)
    if (locked && value !== '' && Number(value) > 0) {
      const other = Math.max(1, Math.round(Number(value) * (dimension === 'width' ? source.height / source.width : source.width / source.height)))
      const otherSetter = dimension === 'width' ? setHeight : setWidth
      otherSetter(String(other))
    }
  }
  function reset() {
    selection.current++
    setSource(null)
    setResult(null)
    setError('')
    setLoading(false)
    input.current.value = ''
  }
  const downloadName = source ? `${source.file.name.replace(/\.[^.]+$/, '')}-${width}x${height}.${format}` : ''
  return <>
    <section className="intro"><span className="eyebrow">A LITTLE LESS BUSYWORK</span><h1>Image Resizer<span>.</span></h1><p>The right size, without the hassle.<br className="mobile-break" /> Resize JPG, PNG, or WebP images in your browser.</p><div className="privacy-badge"><span aria-hidden="true">&#10003;</span> Your images never leave your device.</div></section>
    <input ref={input} className="file-input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" aria-label="Choose an image" onChange={(event) => { choose(event.target.files[0]); event.target.value = '' }} />
    {error && <p className="error" role="alert">{error}</p>}
    {!source ? <section className={`upload-card ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]) }}>
      <div className="upload-icon"><PictureIcon /></div><h2>{loading ? 'Opening your image…' : 'Drop your image here'}</h2><p>or choose one from your device</p><button className="primary" onClick={() => input.current.click()} disabled={loading}>Choose an image <span aria-hidden="true">&#8599;</span></button><span className="supported">JPG, PNG, or WebP</span>
    </section> : <div className="workspace" aria-busy={loading}>
      <section className="panel settings"><div className="panel-heading"><h2>Make it fit</h2><span className="step">01 / SETTINGS</span></div>
        <p className="filename" title={source.file.name}>{source.file.name}</p><p className="source-meta">{source.width} × {source.height} px · {source.format.toUpperCase()} · {fileSize(source.file.size)}</p>
        <div className="dimensions"><label>Width<div className="number-field"><input aria-label="Width" type="number" inputMode="numeric" min="1" max={MAX_DIMENSION} step="1" aria-invalid={!valid} aria-describedby={!valid ? "dimension-error" : undefined} value={width} onChange={(event) => changeDimension(event.target.value, 'width')} /><span aria-hidden="true">px</span></div></label><label>Height<div className="number-field"><input aria-label="Height" type="number" inputMode="numeric" min="1" max={MAX_DIMENSION} step="1" aria-invalid={!valid} aria-describedby={!valid ? "dimension-error" : undefined} value={height} onChange={(event) => changeDimension(event.target.value, 'height')} /><span aria-hidden="true">px</span></div></label></div>
        <label className="lock"><input type="checkbox" checked={locked} onChange={(event) => { setLocked(event.target.checked); if (event.target.checked && width > 0) setHeight(String(Math.max(1, Math.round(width * source.height / source.width)))) }} /> Keep original aspect ratio</label>
        {source.width !== initialDimensions(source).width || source.height !== initialDimensions(source).height ? <p className="format-note">This large image starts at a smaller output size for reliable resizing. Your original stays unchanged.</p> : null}
        {!valid && <p id="dimension-error" className="error" role="alert">Use whole numbers from 1 to {MAX_DIMENSION.toLocaleString()}, with no more than 24 million pixels total.</p>}
        <fieldset><legend>Output format</legend><div className="format-options">{['jpg', 'png', 'webp'].map((item) => <label key={item} className={format === item ? 'selected' : ''}><input type="radio" name="format" value={item} checked={format === item} onChange={() => setFormat(item)} />{item.toUpperCase()}</label>)}</div></fieldset>
        {format !== 'png' && <label className="quality">Quality <strong>{quality}%</strong><input type="range" min="1" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /><span>Smaller file<span>More detail</span></span></label>}
        <p className="format-note">{format === 'jpg' ? 'Transparent areas become white in JPG.' : 'Transparency is preserved.'} Animated images export as a still image.</p>
        <a className={`primary download ${!currentResult?.blob ? 'disabled' : ''}`} href={currentResult?.url} download={downloadName} aria-disabled={!currentResult?.blob} onClick={(event) => { if (!currentResult?.blob) event.preventDefault() }}>Download image <span aria-hidden="true">&#8595;</span></a>
        <div className="secondary-actions"><button onClick={() => { setWidth(String(initialDimensions(source).width)); setHeight(String(initialDimensions(source).height)); setFormat(source.format); setQuality(90); setLocked(true); setError('') }}>Reset settings</button><button onClick={reset}>Choose another image</button></div>
      </section>
      <section className="panel previews"><div className="panel-heading"><h2>A quick look</h2><span className="step">02 / PREVIEW</span></div><div className="preview-label"><h3>Original</h3><span>{fileSize(source.file.size)}</span></div><div className="image-stage"><img src={source.url} alt="Original selected image" /></div><div className="preview-label"><h3>Resized <span className="format-tag">{format.toUpperCase()}</span></h3><span>{currentResult?.blob ? fileSize(currentResult.blob.size) : '—'}</span></div><div className="image-stage" aria-live="polite">{currentResult?.blob ? <img src={currentResult.url} alt={`Resized image at ${width} by ${height} pixels`} /> : <p>{!valid ? 'Enter valid dimensions to preview.' : currentResult?.error || 'Creating your preview…'}</p>}</div><p className="output-meta" role="status">{currentResult?.blob ? `${width} × ${height} px · ${fileSize(currentResult.blob.size)} · Ready to download` : currentResult?.error || 'Preview updates automatically as you make changes.'}</p></section>
    </div>}
    <section className="reassurance"><div><span aria-hidden="true">&#8596;</span><h3>Just the right size</h3><p>Set your dimensions. Keep your proportions.</p></div><div><span aria-hidden="true">&#9672;</span><h3>Your format, your choice</h3><p>Export as JPG, PNG, or WebP.</p></div><div><span aria-hidden="true">&#8961;</span><h3>Private by default</h3><p>Processed locally in your browser. Never uploaded.</p></div></section>
  </>
}
