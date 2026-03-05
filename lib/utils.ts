export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDateLabel(ts: number): string {
  const date = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function groupByDate<T extends { timestamp: number }>(
  items: T[]
): { label: string; items: T[] }[] {
  return items.reduce<{ label: string; items: T[] }[]>((acc, item) => {
    const label = formatDateLabel(item.timestamp)
    const last = acc[acc.length - 1]
    if (last && last.label === label) last.items.push(item)
    else acc.push({ label, items: [item] })
    return acc
  }, [])
}

export function playNotifSound(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // silently ignore — Web Audio API may not be available
  }
}
