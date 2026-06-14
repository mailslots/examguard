export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function cheatEventLabel(type: string) {
  const labels: Record<string, string> = {
    tab_switch: 'Tab Switch',
    copy_attempt: 'Copy Attempt',
    fullscreen_exit: 'Exited Fullscreen',
    window_blur: 'Window Lost Focus',
    right_click: 'Right Click',
    keyboard_shortcut: 'Keyboard Shortcut',
  }
  return labels[type] ?? type
}
