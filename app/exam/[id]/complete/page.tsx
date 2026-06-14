import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { cheatEventLabel, formatDate } from '@/lib/utils'
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

export default async function ExamCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*, exams(title, duration_minutes), cheat_events(*)')
    .eq('exam_id', id)
    .eq('student_id', user.id)
    .single()

  if (!attempt) redirect('/student/dashboard')
  if (attempt.status === 'in_progress') redirect(`/exam/${id}`)

  const exam = attempt.exams as { title: string } | null
  const events = (attempt.cheat_events ?? []) as { event_type: string; occurred_at: string }[]
  const pct = attempt.score !== null && attempt.max_score && attempt.max_score > 0
    ? Math.round((attempt.score / attempt.max_score) * 100) : null
  const autoSubmitted = attempt.status === 'auto_submitted'
  const hasMcqScore = attempt.score !== null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-4 text-center">
          {autoSubmitted ? (
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-orange-500" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {autoSubmitted ? 'Exam Auto-Submitted' : 'Exam Submitted!'}
          </h1>
          <p className="text-gray-500 text-sm">{exam?.title}</p>

          {hasMcqScore && (
            <div className="mt-6 mb-2">
              <div className="text-5xl font-bold text-gray-900 mb-1">
                {pct !== null ? `${pct}%` : '—'}
              </div>
              <p className="text-gray-500 text-sm">{attempt.score} / {attempt.max_score} points</p>
              {pct !== null && (
                <div className="mt-4 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {!hasMcqScore && (
            <div className="mt-4 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
              Your answers have been submitted. Your teacher will review and score them.
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{attempt.cheat_count}</p>
              <p className="text-xs text-gray-500 mt-0.5">Violation{attempt.cheat_count !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Badge variant={autoSubmitted ? 'warning' : 'success'} className="text-sm py-1">
                {autoSubmitted ? 'Auto-Submitted' : 'Completed'}
              </Badge>
              <p className="text-xs text-gray-500 mt-1.5">{formatDate(attempt.submitted_at ?? '')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cheat events */}
        {events.length > 0 && (
          <Card className="mb-4">
            <CardContent className="py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-orange-500" /> Violation Log
              </p>
              <div className="space-y-1.5">
                {events.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-red-600">{cheatEventLabel(ev.event_type)}</span>
                    <span className="text-gray-400">{formatDate(ev.occurred_at)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
