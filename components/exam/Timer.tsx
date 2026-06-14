'use client'

import { useEffect, useState, useRef } from 'react'
import { formatTime } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface TimerProps {
  durationMinutes: number
  startedAt: string
  onTimeUp: () => void
}

export function Timer({ durationMinutes, startedAt, onTimeUp }: TimerProps) {
  const totalSeconds = durationMinutes * 60
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, totalSeconds - elapsed))
  const calledTimeUp = useRef(false)

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!calledTimeUp.current) {
        calledTimeUp.current = true
        onTimeUp()
      }
      return
    }
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          if (!calledTimeUp.current) {
            calledTimeUp.current = true
            onTimeUp()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const pct = secondsLeft / totalSeconds
  const urgent = pct <= 0.1
  const warning = pct <= 0.25

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold ${urgent ? 'bg-red-100 text-red-700 animate-pulse' : warning ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
      <Clock size={16} />
      {formatTime(secondsLeft)}
    </div>
  )
}
