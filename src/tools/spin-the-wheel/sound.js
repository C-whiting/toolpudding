export function createWheelSound() {
  const Audio = window.AudioContext || window.webkitAudioContext
  if (!Audio) return null
  try {
    const context = new Audio()
    let lastTick = 0
    const note = (frequency, duration, delay = 0, volume = .035) => {
      if (context.state !== 'running') return
      const time = context.currentTime + delay
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(volume, time)
      gain.gain.exponentialRampToValueAtTime(.0001, time + duration)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(time)
      oscillator.stop(time + duration)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    }
    return {
      resume: () => context.resume().catch(() => {}),
      tick: () => { if (context.currentTime - lastTick < .06) return; lastTick = context.currentTime; note(700, .035, 0, .018) },
      winner: () => { note(523, .18); note(659, .18, .12); note(784, .3, .24) },
      close: () => context.close().catch(() => {}),
    }
  } catch { return null }
}
