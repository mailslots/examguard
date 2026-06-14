'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAntiCheat } from '@/hooks/useAntiCheat'
import type { Exam, Question, Answer, CheatEventType } from '@/types'
import { QuestionRenderer } from '@/components/exam/QuestionRenderer'
import { Timer } from '@/components/exam/Timer'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatDuration, cheatEventLabel } from '@/lib/utils'
import { ShieldCheck, AlertTriangle, Maximize2, CheckCircle } from 'lucide-react'

type ExamWithQuestions = Exam & { questions: Question[] }

type Phase = 'loading' | 'instructions' | 'exam' | 'submitting' | 'done'

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const examId = params.id as string

  const [phase, setPhase] = useState<Phase>('loading')
  const [exam, setExam] = useState<ExamWithQuestions | null>(null)
  const [attemptId, setAttemptId] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [answers, setAnswers] = useState<Record<string, Partial<Answer>>>({})
  const [warning, setWarning] = useState<{ count: number; type: CheatEventType } | null>(null)
  const [autoSubmitModal, setAutoSubmitModal] = useState(false)
  const submitting = useRef(false)

  // Load exam and create/resume attempt
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: examData } = await supabase
        .from('exams')
        .select('*, questions(*, question_options(*))')
        .eq('id', examId)
        .single()

      if (!examData) { router.push('/student/dashboard'); return }

      // Sort questions by order_index
      examData.questions = (examData.questions ?? []).sort((a: Question, b: Question) => a.order_index - b.order_index)
      if (examData.shuffle_questions) {
        examData.questions = examData.questions.sort(() => Math.random() - 0.5)
      }

      setExam(examData as ExamWithQuestions)

      // Check for existing attempt
      const { data: existing } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', user.id)
        .single()

      if (existing) {
        if (existing.status !== 'in_progress') {
          router.push(`/exam/${examId}/complete`)
          return
        }
        setAttemptId(existing.id)
        setStartedAt(existing.started_at)

        // Load existing answers
        const { data: savedAnswers } = await supabase
          .from('answers')
          .select('*')
          .eq('attempt_id', existing.id)

        const answerMap: Record<string, Partial<Answer>> = {}
        savedAnswers?.forEach(a => { answerMap[a.question_id] = a })
        setAnswers(answerMap)
        setPhase('exam')
      } else {
        setPhase('instructions')
      }
    }
    init()
  }, [examId])

  const startExam = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('exam_attempts')
      .insert({ exam_id: examId, student_id: user!.id })
      .select()
      .single()
    if (data) {
      setAttemptId(data.id)
      setStartedAt(data.started_at)
      setPhase('exam')
    }
  }, [examId, supabase])

  const submitExam = useCallback(async (auto = false) => {
    if (submitting.current || !attemptId) return
    submitting.current = true
    setPhase('submitting')

    // Calculate score for MCQ
    let score = 0
    let maxScore = 0
    const answerInserts: object[] = []

    exam?.questions.forEach(q => {
      maxScore += q.points
      const userAnswer = answers[q.id]
      let isCorrect: boolean | null = null
      let pointsEarned = 0

      if (q.type === 'mcq' && userAnswer?.selected_option_id) {
        const correct = q.question_options?.find(o => o.is_correct)
        isCorrect = correct?.id === userAnswer.selected_option_id
        pointsEarned = isCorrect ? q.points : 0
        score += pointsEarned
      }

      answerInserts.push({
        attempt_id: attemptId,
        question_id: q.id,
        selected_option_id: userAnswer?.selected_option_id ?? null,
        text_answer: userAnswer?.text_answer ?? null,
        is_correct: isCorrect,
        points_earned: pointsEarned,
      })
    })

    await Promise.allSettled([
      supabase.from('answers').upsert(answerInserts, { onConflict: 'attempt_id,question_id' }),
      supabase.from('exam_attempts').update({
        status: auto ? 'auto_submitted' : 'submitted',
        submitted_at: new Date().toISOString(),
        score,
        max_score: maxScore,
      }).eq('id', attemptId),
    ])

    router.push(`/exam/${examId}/complete`)
  }, [attemptId, exam, answers, examId, router, supabase])

  const saveAnswer = useCallback(async (questionId: string, update: Partial<Answer>) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...update } }))
    if (attemptId) {
      await supabase.from('answers').upsert({
        attempt_id: attemptId,
        question_id: questionId,
        ...update,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'attempt_id,question_id' })
    }
  }, [attemptId, supabase])

  const { requestFullscreen } = useAntiCheat({
    attemptId,
    maxWarnings: exam?.max_warnings ?? 3,
    enabled: phase === 'exam',
    onWarning: (count, eventType) => setWarning({ count, type: eventType }),
    onAutoSubmit: () => { setAutoSubmitModal(true); setTimeout(() => submitExam(true), 3000) },
  })

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Instructions screen
  if (phase === 'instructions' && exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-lg w-full p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-500">{formatDuration(exam.duration_minutes)} · {exam.questions.length} questions</p>
            </div>
          </div>

          {exam.description && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-gray-700 leading-relaxed">
              {exam.description}
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Anti-Cheat Rules
            </h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Do not switch tabs or minimise the window</li>
              <li>• Copy and paste are disabled during the exam</li>
              <li>• The exam will go fullscreen — do not exit it</li>
              <li>• You have <strong>{exam.max_warnings} warning{exam.max_warnings !== 1 ? 's' : ''}</strong> before the exam auto-submits</li>
              <li>• All violations are logged and visible to your teacher</li>
            </ul>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              requestFullscreen()
              startExam()
            }}
          >
            <Maximize2 size={16} /> Enter Exam (Fullscreen)
          </Button>
        </div>
      </div>
    )
  }

  // Submitting
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Submitting your exam...</p>
        </div>
      </div>
    )
  }

  if (!exam || phase !== 'exam') return null

  const answeredCount = exam.questions.filter(q => {
    const a = answers[q.id]
    return a?.selected_option_id || a?.text_answer?.trim()
  }).length

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
              <p className="text-sm font-semibold text-gray-900 leading-none">{exam.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{answeredCount}/{exam.questions.length} answered</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {startedAt && <Timer durationMinutes={exam.duration_minutes} startedAt={startedAt} onTimeUp={() => submitExam(true)} />}
            <Button size="sm" onClick={() => submitExam(false)} variant="primary">Submit</Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Questions */}
        <div className="flex-1 space-y-4">
          {exam.questions.map((q, idx) => (
            <div key={q.id} id={`q-${idx}`}>
              <QuestionRenderer
                question={q}
                index={idx}
                answer={answers[q.id]}
                onChange={saveAnswer}
              />
            </div>
          ))}
          <div className="h-6" />
          <Button className="w-full" size="lg" onClick={() => submitExam(false)}>
            <CheckCircle size={16} /> Submit Exam
          </Button>
        </div>

        {/* Question navigator */}
        <div className="hidden lg:block w-44 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Questions</p>
            <div className="grid grid-cols-4 gap-1.5">
              {exam.questions.map((q, idx) => {
                const answered = !!(answers[q.id]?.selected_option_id || answers[q.id]?.text_answer?.trim())
                return (
                  <a
                    key={q.id}
                    href={`#q-${idx}`}
                    className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${answered ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {idx + 1}
                  </a>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">{answeredCount} of {exam.questions.length} done</p>
          </div>
        </div>
      </div>

      {/* Warning modal */}
      <Modal open={!!warning} onClose={() => setWarning(null)} title="Warning" hideClose className="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-4">
            <AlertTriangle size={20} className="text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Violation Detected</p>
              <p className="text-sm text-orange-600">{warning && cheatEventLabel(warning.type)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Warning <strong>{warning?.count}</strong> of <strong>{exam.max_warnings}</strong>.
            {warning && warning.count < exam.max_warnings && ' Further violations will auto-submit your exam.'}
          </p>
          <Button className="w-full" onClick={() => { setWarning(null); requestFullscreen() }}>
            I understand — Return to Exam
          </Button>
        </div>
      </Modal>

      {/* Auto-submit modal */}
      <Modal open={autoSubmitModal} title="Exam Auto-Submitted" hideClose className="max-w-sm">
        <div className="space-y-4 text-center">
          <AlertTriangle size={40} className="text-red-500 mx-auto" />
          <p className="text-sm text-gray-600">You have exceeded the maximum number of violations. Your exam is being submitted automatically.</p>
          <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </Modal>
    </div>
  )
}
