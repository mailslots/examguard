'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ShieldCheck, AlertTriangle, Maximize2, CheckCircle, X, Copy, ExternalLink } from 'lucide-react'
import { Timer } from '@/components/exam/Timer'
import { formatTime } from '@/lib/utils'

const DEMO_QUESTIONS = [
  {
    id: 'q1',
    text: 'What does Exaon do when you switch to a different browser tab during an exam?',
    points: 2,
    options: [
      { id: 'q1a', text: 'Nothing — tab-switching is allowed', correct: false },
      { id: 'q1b', text: 'It logs a cheat warning and notifies your teacher', correct: true },
      { id: 'q1c', text: 'It pauses the timer', correct: false },
      { id: 'q1d', text: 'It submits the exam immediately', correct: false },
    ],
  },
  {
    id: 'q2',
    text: 'How many violations can a student have before the exam is auto-submitted (default setting)?',
    points: 2,
    options: [
      { id: 'q2a', text: '1', correct: false },
      { id: 'q2b', text: '2', correct: false },
      { id: 'q2c', text: '3', correct: true },
      { id: 'q2d', text: '5', correct: false },
    ],
  },
  {
    id: 'q3',
    text: 'Which of these actions will trigger an anti-cheat warning during an exam?',
    points: 2,
    options: [
      { id: 'q3a', text: 'Scrolling up and down the page', correct: false },
      { id: 'q3b', text: 'Clicking a different answer', correct: false },
      { id: 'q3c', text: 'Pressing Ctrl+C to copy text', correct: true },
      { id: 'q3d', text: 'Clicking the Submit button', correct: false },
    ],
  },
  {
    id: 'q4',
    text: 'What happens to your answers if the internet connection is briefly lost during an exam?',
    points: 2,
    options: [
      { id: 'q4a', text: 'All answers are lost permanently', correct: false },
      { id: 'q4b', text: 'Answers are saved locally and synced to the server every 30 seconds', correct: true },
      { id: 'q4c', text: 'The exam automatically submits', correct: false },
      { id: 'q4d', text: 'The timer pauses', correct: false },
    ],
  },
  {
    id: 'q5',
    text: 'Who can see the full cheat event log after a student submits their exam?',
    points: 2,
    options: [
      { id: 'q5a', text: 'No one — it is deleted after submission', correct: false },
      { id: 'q5b', text: 'Only the student', correct: false },
      { id: 'q5c', text: 'The teacher (admin) through the results panel', correct: true },
      { id: 'q5d', text: 'Any logged-in user', correct: false },
    ],
  },
]

type Phase = 'instructions' | 'exam' | 'complete'
type Warning = { type: string; label: string; count: number }

const CHEAT_LABELS: Record<string, string> = {
  tab_switch: 'Tab switch detected',
  window_blur: 'Window focus lost',
  right_click: 'Right-click blocked',
  copy_attempt: 'Copy/paste blocked',
  keyboard_shortcut: 'Keyboard shortcut blocked',
  fullscreen_exit: 'Fullscreen exited',
}

const MAX_WARNINGS = 3
const DEMO_DURATION = 5 // minutes

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>('instructions')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [activeWarning, setActiveWarning] = useState<Warning | null>(null)
  const [autoSubmitModal, setAutoSubmitModal] = useState(false)
  const [violationLog, setViolationLog] = useState<{ label: string; time: string }[]>([])
  const warningCount = useRef(0)
  const autoSubmitted = useRef(false)
  const startedAt = useRef(new Date().toISOString())

  const logViolation = useCallback((type: string) => {
    if (autoSubmitted.current) return
    warningCount.current += 1
    const count = warningCount.current
    const label = CHEAT_LABELS[type] ?? type
    setViolationLog(prev => [...prev, { label, time: new Date().toLocaleTimeString() }])
    if (count >= MAX_WARNINGS) {
      autoSubmitted.current = true
      setAutoSubmitModal(true)
      setTimeout(() => setPhase('complete'), 3000)
    } else {
      setActiveWarning({ type, label, count })
    }
  }, [])

  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(() => {})
  }, [])

  // Anti-cheat listeners (active only during exam phase)
  useEffect(() => {
    if (phase !== 'exam') return

    const onVisibility = () => { if (document.hidden) logViolation('tab_switch') }
    const onBlur = () => logViolation('window_blur')
    const onContextMenu = (e: MouseEvent) => { e.preventDefault(); logViolation('right_click') }
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); logViolation('copy_attempt') }
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); logViolation('copy_attempt') }
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        logViolation('keyboard_shortcut')
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault()
      }
    }
    const onFullscreen = () => {
      if (!document.fullscreenElement) logViolation('fullscreen_exit')
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCut)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreen)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCut)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [phase, logViolation])

  const exitDemo = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    window.location.href = '/'
  }

  const startDemo = () => {
    startedAt.current = new Date().toISOString()
    warningCount.current = 0
    autoSubmitted.current = false
    requestFullscreen()
    setPhase('exam')
  }

  const score = DEMO_QUESTIONS.reduce((acc, q) => {
    const chosen = q.options.find(o => o.id === selectedAnswers[q.id])
    return acc + (chosen?.correct ? q.points : 0)
  }, 0)
  const maxScore = DEMO_QUESTIONS.reduce((acc, q) => acc + q.points, 0)
  const answeredCount = Object.keys(selectedAnswers).length

  /* ─── Instructions ─── */
  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Interactive Demo — Exaon</h1>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">Demo Mode</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-5 mt-3">
            This is a <strong>live preview</strong> of the exam experience. All anti-cheat features are active — try switching tabs, right-clicking, or pressing Ctrl+C to see what happens.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600 space-y-1.5">
            <p>📋 <strong>5 questions</strong> about how Exaon works</p>
            <p>⏱ <strong>{DEMO_DURATION}-minute</strong> countdown timer</p>
            <p>🛡 <strong>Anti-cheat active</strong> — {MAX_WARNINGS} warnings before auto-submit</p>
            <p>🖥 <strong>Fullscreen mode</strong> will be requested</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Anti-Cheat Rules (Active in Demo)
            </h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Switching tabs triggers a warning</li>
              <li>• Right-click is blocked</li>
              <li>• Ctrl+C / Ctrl+X / paste are blocked</li>
              <li>• Exiting fullscreen triggers a warning</li>
              <li>• After {MAX_WARNINGS} warnings → auto-submit</li>
            </ul>
          </div>

          <button
            onClick={startDemo}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base"
          >
            <Maximize2 size={18} /> Start Interactive Demo
          </button>

          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  /* ─── Results ─── */
  if (phase === 'complete') {
    const pct = Math.round((score / maxScore) * 100)
    const auto = autoSubmitted.current
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-8 text-center">
          {auto ? (
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-orange-500" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
          )}

          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-3">Demo Mode</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{auto ? 'Auto-Submitted' : 'Demo Complete!'}</h1>
          <p className="text-gray-400 text-sm mb-6">Exaon Platform Demo · 5 Questions</p>

          <div className="text-5xl font-bold text-gray-900 mb-1">{pct}%</div>
          <p className="text-gray-500 text-sm mb-2">{score} / {maxScore} points</p>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{warningCount.current}</p>
              <p className="text-gray-400 text-xs mt-0.5">Violations</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{answeredCount}/5</p>
              <p className="text-gray-400 text-xs mt-0.5">Answered</p>
            </div>
          </div>

          {violationLog.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 text-left mb-6">
              <p className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Violation Log</p>
              <div className="space-y-1">
                {violationLog.map((v, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-red-600">{v.label}</span>
                    <span className="text-gray-400">{v.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/register" className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm">
              Create Your Account — It&apos;s Free
            </Link>
            <button onClick={() => { setSelectedAnswers({}); setViolationLog([]); setPhase('instructions') }}
              className="block w-full border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Try Demo Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Exam ─── */
  return (
    <div className="min-h-screen bg-gray-50 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={14} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 leading-none">Platform Demo</p>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded">DEMO</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{answeredCount}/{DEMO_QUESTIONS.length} answered</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Timer
              durationMinutes={DEMO_DURATION}
              startedAt={startedAt.current}
              onTimeUp={() => { autoSubmitted.current = false; setPhase('complete') }}
            />
            <button
              onClick={() => { autoSubmitted.current = false; if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); setPhase('complete') }}
              className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={exitDemo}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="Exit Demo"
            >
              <X size={14} /> Exit
            </button>
          </div>
        </div>
      </div>

      {/* Anti-cheat badge */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-orange-700">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} />
            <span>Anti-cheat active · Fullscreen · No copy/paste · No tab switch · {MAX_WARNINGS - warningCount.current} warnings remaining</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Copy size={11} /> Blocked</span>
            <span className="flex items-center gap-1"><ExternalLink size={11} /> Fullscreen</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Questions */}
        <div className="flex-1 space-y-4">
          {DEMO_QUESTIONS.map((q, idx) => (
            <div key={q.id} id={`q-${idx}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start gap-3 mb-5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-gray-900 font-medium leading-relaxed">{q.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{q.points} points · Multiple choice</p>
                </div>
              </div>
              <div className="space-y-2 ml-11">
                {q.options.map(opt => {
                  const selected = selectedAnswers[q.id] === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? 'border-blue-500' : 'border-gray-400'}`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        checked={selected}
                        onChange={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                        className="sr-only"
                      />
                      <span className={`text-sm ${selected ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>{opt.text}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="h-4" />
          <button
            onClick={() => { autoSubmitted.current = false; if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); setPhase('complete') }}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Submit Demo Exam
          </button>
        </div>

        {/* Navigator */}
        <div className="hidden lg:block w-44 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Questions</p>
            <div className="grid grid-cols-4 gap-1.5">
              {DEMO_QUESTIONS.map((q, idx) => (
                <a key={q.id} href={`#q-${idx}`}
                  className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${selectedAnswers[q.id] ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {idx + 1}
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">{answeredCount} of 5 done</p>
          </div>

          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1">
              <AlertTriangle size={11} /> Violations
            </p>
            <div className="flex gap-1 mb-1">
              {Array.from({ length: MAX_WARNINGS }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < warningCount.current ? 'bg-red-500' : 'bg-orange-200'}`} />
              ))}
            </div>
            <p className="text-xs text-orange-500">{warningCount.current} of {MAX_WARNINGS} used</p>
          </div>
        </div>
      </div>

      {/* Warning modal */}
      {activeWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-4 mb-4">
              <AlertTriangle size={22} className="text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-800">Violation Detected</p>
                <p className="text-sm text-orange-600">{activeWarning.label}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Warning <strong>{activeWarning.count}</strong> of <strong>{MAX_WARNINGS}</strong>.
              {activeWarning.count < MAX_WARNINGS && ' One more violation will auto-submit your exam.'}
            </p>
            <button
              onClick={() => { setActiveWarning(null); requestFullscreen() }}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              I understand — Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Auto-submit modal */}
      {autoSubmitModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertTriangle size={44} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Exam Auto-Submitted</h2>
            <p className="text-sm text-gray-500 mb-4">Maximum violations reached. Your exam has been submitted automatically.</p>
            <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      )}
    </div>
  )
}
