import { useMemo } from 'react'

const point = (angle, radius) => [200 + Math.cos(angle * Math.PI / 180) * radius, 200 + Math.sin(angle * Math.PI / 180) * radius]

export default function Wheel({ choices, rotation, spinning, disabled, onSpin }) {
  const segments = useMemo(() => choices.map((choice, index) => {
    const step = 360 / choices.length
    const start = -90 + index * step
    const end = start + step
    const [x1, y1] = point(start, 185)
    const [x2, y2] = point(end, 185)
    const angle = start + step / 2
    const [x, y] = point(angle, 124)
    const flip = angle > 90 && angle < 270
    const length = choices.length <= 6 ? 20 : choices.length <= 12 ? 13 : 9
    const label = choices.length > 24 ? String(index + 1) : choice.label.length > length ? `${choice.label.slice(0, length - 1)}\u2026` : choice.label
    const color = `hsl(${(155 + index * 137.508) % 360} 45% 76%)`
    return <g key={index}>
      {choices.length === 1 ? <circle cx="200" cy="200" r="185" fill={color} /> : <path d={`M 200 200 L ${x1} ${y1} A 185 185 0 ${step > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={color} stroke="#fff" strokeWidth="1.5" />}
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${angle + (flip ? 180 : 0)},${x},${y})`} fill="#263a36" fontSize={choices.length > 24 ? 9 : choices.length > 12 ? 11 : 14} fontWeight="600">{label}</text>
    </g>
  }), [choices])

  return <div className="wheel-frame">
    <span className="wheel-pointer" aria-hidden="true" />
    <button className="wheel-surface" type="button" disabled={spinning || disabled || choices.length < 2} onClick={onSpin} aria-label={spinning ? 'Wheel is spinning' : 'Spin the wheel'}>
      <svg className="wheel-disc" viewBox="0 0 400 400" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}>
        <circle cx="200" cy="200" r="192" fill="#fff" stroke="#d3dfcf" strokeWidth="3" />
        {choices.length ? segments : <circle cx="200" cy="200" r="185" fill="#edf3ec" />}
      </svg>
      <span className="wheel-hub" aria-hidden="true">{spinning ? '\u2022\u2022\u2022' : 'SPIN'}<small>{spinning ? 'Here we go' : 'Give it a whirl'}</small></span>
    </button>
  </div>
}
