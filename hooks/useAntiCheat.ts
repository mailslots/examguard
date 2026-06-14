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

export function useAntiCheat({ attemptId, maxWarnings, enabled, onWarning, onAutoSubmit }: UseAntiCheatOptions) {
  const warningCount = useRef(0)
  const supabase = createClient()
  const autoSubmitted = useRef(false)

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

    const onVisibilityChange = () => { if (document.hidden) logEvent('tab_switch') }
    const onBlur = () => logEvent('window_blur')
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); logEvent('right_click') }
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
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCut)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
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
