'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CheatEventType } from '@/types'

interface UseAntiCheatOptions {
  attemptId: string
  maxWarnings: number
  enabled: boolean
  onWarning: (count: number, eventType: CheatEventType) => void
  onAutoSubmit: () => void
}

// Detect touch/pointer-coarse devices (phones, tablets)
function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

export function useAntiCheat({ attemptId, maxWarnings, enabled, onWarning, onAutoSubmit }: UseAntiCheatOptions) {
  const warningCount = useRef(0)
  const supabase = createClient()
  const autoSubmitted = useRef(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const logEvent = useCallback(async (eventType: CheatEventType) => {
    if (!enabled || autoSubmitted.current) return

    warningCount.current += 1
    const count = warningCount.current

    await Promise.allSettled([
      supabase.from('cheat_events').insert({ attempt_id: attemptId, event_type: eventType }),
      supabase.from('exam_attempts').update({ cheat_count: count }).eq('id', attemptId),
    ])

    if (count >= maxWarnings) {
      autoSubmitted.current = true
      onAutoSubmit()
    } else {
      onWarning(count, eventType)
    }
  }, [attemptId, maxWarnings, enabled, onWarning, onAutoSubmit, supabase])

  useEffect(() => {
    if (!enabled) return

    const onVisibilityChange = () => {
      if (document.hidden) logEvent('tab_switch')
    }

    // Grace period: only count blur if focus doesn't return within 3 seconds.
    // Prevents false positives from mobile notification swipes, auto-correct popups, etc.
    const onBlur = () => {
      if (blurTimer.current) return
      blurTimer.current = setTimeout(() => {
        blurTimer.current = null
        logEvent('window_blur')
      }, 3000)
    }

    const onFocus = () => {
      if (blurTimer.current) {
        clearTimeout(blurTimer.current)
        blurTimer.current = null
      }
    }

    // Context menu: always prevent (stops long-press popup on mobile),
    // but only count as a violation on desktop (mouse) — mobile long-press is too accidental.
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      if (!isTouchDevice()) {
        logEvent('right_click')
      }
    }

    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); logEvent('copy_attempt') }
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); logEvent('copy_attempt') }

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        logEvent('keyboard_shortcut')
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault()
      }
    }

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) logEvent('fullscreen_exit')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCut)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCut)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [enabled, logEvent])

  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])

  return { warningCount: warningCount.current, requestFullscreen, exitFullscreen }
}
