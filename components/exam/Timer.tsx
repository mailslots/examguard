'use client'

import { useEffect, useState, useRef } from 'react'
import { formatTime } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface TimerProps {
  durationMinutes: number
  startedAt: string
  endAt?: string | null
  onTimeUp: () => void
}

export function Timer({ durationMinutes, startedAt, endAt, onTimeUp }: TimerProps) {
  const durationDeadline = new Date(startedAt).getTime() + durationMinutes * 60_000
  const effectiveDeadline = endAt
    ? Math.min(durationDeadline, new Date(endAt).getTime())
    : durationDeadline
  const totalRef = Math.max(1, Math.floor((effectiveDeadline - new Date(startedAt).getTime()) / 1000))

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((effectiveDeadline - Date.now()) / 1000))
  )
  const calledTimeUp = useRef(false)

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!calledTimeUp.current) { calledTimeUp.current = true; onTimeUp() }
      return
    }
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.floor((effectiveDeadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0 && !calledTimeUp.current) {
        calledTimeUp.current = true
        clearInterval(id)
        onTimeUp()
      }
    }, 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pct = secondsLeft / totalRef
  const urgent = pct <= 0.1
  const warning = pct <= 0.25

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold ${urgent ? 'bg-red-100 text-red-700 animate-pulse' : warning ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
      <Clock size={16} />
      {formatTime(secondsLeft)}
    </div>
  )
}
