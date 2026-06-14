import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate, cheatEventLabel } from '@/lib/utils'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: exam } = await supabase.from('exams').select('*, classes(name, admin_id)').eq('id', id).single()
  if (!exam) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const cls = exam.classes as { name: string; admin_id: string } | null
  if (cls?.admin_id !== user!.id) notFound()

  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('*, profiles(full_name, email), cheat_events(event_type, occurred_at)')
    .eq('exam_id', id)
    .order('submitted_at', { ascending: false })

  const totalPoints = (await supabase.from('questions').select('points').eq('exam_id', id)).data?.reduce((s, q) => s + q.points, 0) ?? 0

  const statusBadge = (status: string) => {
    if (status === 'submitted') return <Badge variant="success">Submitted</Badge>
    if (status === 'auto_submitted') return <Badge variant="warning">Auto-Submitted</Badge>
    return <Badge variant="info">In Progress</Badge>
  }

  return (
    <div className="p-8 max-w-5xl">
      <Link href={`/admin/exams/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to Exam
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{exam.title} — Results</h1>
        <p className="text-gray-500 mt-1">{cls?.name} · {attempts?.length ?? 0} submissions · {totalPoints} total points</p>
      </div>

      {(!attempts || attempts.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map(attempt => {
            const profile = attempt.profiles as { full_name: string; email: string } | null
            const events = attempt.cheat_events as { event_type: string; occurred_at: string }[] ?? []
            const score = attempt.score !== null ? `${attempt.score}/${attempt.max_score ?? totalPoints}` : '—'
            const pct = attempt.score !== null && (attempt.max_score ?? totalPoints) > 0
              ? Math.round((attempt.score / (attempt.max_score ?? totalPoints)) * 100) : null

            return (
              <Card key={attempt.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{profile?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{profile?.email}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {statusBadge(attempt.status)}
                      <span className="text-sm font-bold text-gray-900">{score} {pct !== null && <span className="text-gray-400 font-normal">({pct}%)</span>}</span>
                      {attempt.cheat_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                          <AlertTriangle size={11} /> {attempt.cheat_count} violation{attempt.cheat_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    {attempt.started_at && <span>Started: {formatDate(attempt.started_at)}</span>}
                    {attempt.submitted_at && <span>Submitted: {formatDate(attempt.submitted_at)}</span>}
                  </div>
                  {events.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Cheat Events:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {events.map((ev, i) => (
                          <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                            {cheatEventLabel(ev.event_type)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
