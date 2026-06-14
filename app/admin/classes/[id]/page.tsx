import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { formatDate, formatDuration } from '@/lib/utils'
import { ArrowLeft, Plus, Users, Clock, FileText, Link2 } from 'lucide-react'

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cls } = await supabase.from('classes').select('*').eq('id', id).eq('admin_id', user!.id).single()
  if (!cls) notFound()

  const [{ data: enrollments }, { data: exams }] = await Promise.all([
    supabase.from('class_enrollments').select('*, profiles(id, full_name, email)').eq('class_id', id).order('enrolled_at'),
    supabase.from('exams').select('*, questions(count)').eq('class_id', id).order('created_at', { ascending: false }),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://exaon.vercel.app'
  const inviteLink = `${siteUrl}/join/${cls.join_code}`

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/admin/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to Classes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
          {cls.description && <p className="text-gray-500 mt-1">{cls.description}</p>}
        </div>
        {/* Join code + invite link */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Join Code</p>
              <p className="font-mono font-bold text-gray-900 text-lg tracking-widest">{cls.join_code}</p>
            </div>
            <CopyButton text={cls.join_code} />
          </div>
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Student invite link</p>
              <p className="text-xs text-gray-400 truncate max-w-[180px]">{inviteLink}</p>
            </div>
            <CopyButton text={inviteLink} label="Copy link" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exams */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FileText size={16} /> Exams ({exams?.length ?? 0})</h2>
            <Link href={`/admin/classes/${id}/exams/new`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus size={14} /> Add Exam
            </Link>
          </div>
          <div className="space-y-3">
            {(!exams || exams.length === 0) ? (
              <Card>
                <CardContent className="text-center py-8 text-gray-400 text-sm">No exams yet</CardContent>
              </Card>
            ) : exams.map(exam => {
              const qCount = Array.isArray(exam.questions) ? exam.questions[0]?.count ?? 0 : 0
              const examLink = `${siteUrl}/exam/${exam.id}`
              return (
                <Card key={exam.id} hover>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/admin/exams/${exam.id}`} className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{exam.title}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1.5">
                          <span className="flex items-center gap-1"><Clock size={11} /> {formatDuration(exam.duration_minutes)}</span>
                          <span>{qCount} questions</span>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={exam.is_published ? 'success' : 'default'}>
                          {exam.is_published ? 'Live' : 'Draft'}
                        </Badge>
                        {exam.is_published && (
                          <CopyButton
                            text={examLink}
                            label=""
                            className="text-gray-400 hover:text-blue-600"
                          />
                        )}
                      </div>
                    </div>
                    {exam.is_published && (
                      <div className="mt-3 flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-1.5">
                        <Link2 size={12} className="text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-500 truncate flex-1">{examLink}</p>
                        <CopyButton text={examLink} label="Copy" className="shrink-0 text-blue-600" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Students */}
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Users size={16} /> Students ({enrollments?.length ?? 0})</h2>
          <Card>
            {(!enrollments || enrollments.length === 0) ? (
              <CardContent className="text-center py-8 text-gray-400 text-sm">
                No students yet. Share the invite link above with your class.
              </CardContent>
            ) : (
              <div className="divide-y divide-gray-100">
                {enrollments.map(e => {
                  const p = e.profiles as { full_name: string; email: string } | null
                  return (
                    <div key={e.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{p?.email}</p>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(e.enrolled_at)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
