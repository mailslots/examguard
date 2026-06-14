'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Exam, Question } from '@/types'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Eye, BarChart3, Clock, AlertTriangle } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export default function ExamEditorPage() {
  const params = useParams()
  const supabase = createClient()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [publishing, setPublishing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [{ data: e }, { data: q }] = await Promise.all([
      supabase.from('exams').select('*, classes(name)').eq('id', examId).single(),
      supabase.from('questions').select('*, question_options(*)').eq('exam_id', examId).order('order_index'),
    ])
    setExam(e)
    setQuestions(q ?? [])
    setLoading(false)
  }, [examId, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const togglePublish = async () => {
    if (!exam) return
    setPublishing(true)
    const { data } = await supabase
      .from('exams')
      .update({ is_published: !exam.is_published })
      .eq('id', examId)
      .select()
      .single()
    if (data) setExam(data)
    setPublishing(false)
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!exam) return <div className="p-8 text-gray-400">Exam not found</div>

  const classId = (exam as Exam & { class_id: string }).class_id

  return (
    <div className="p-8 max-w-4xl">
      <Link href={`/admin/classes/${classId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to Class
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <Badge variant={exam.is_published ? 'success' : 'default'}>
              {exam.is_published ? 'Live' : 'Draft'}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm">{(exam as Exam & { classes?: { name: string } }).classes?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/exams/${examId}/results`}>
            <Button variant="outline" size="sm"><BarChart3 size={15} /> Results</Button>
          </Link>
          <Button onClick={togglePublish} loading={publishing} variant={exam.is_published ? 'secondary' : 'primary'} size="sm">
            <Eye size={15} /> {exam.is_published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Exam settings summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <Clock size={16} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-gray-900">{formatDuration(exam.duration_minutes)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">Max Warnings</p>
            <p className="text-sm font-semibold text-gray-900">{exam.max_warnings}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <Eye size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Questions</p>
            <p className="text-sm font-semibold text-gray-900">{questions.length}</p>
          </div>
        </div>
      </div>

      {exam.is_published && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle size={15} />
          This exam is live. Editing questions may affect students who are currently taking it.
        </div>
      )}

      {exam.description && (
        <Card className="mb-6">
          <CardHeader><p className="text-sm font-medium text-gray-700">Instructions</p></CardHeader>
          <CardContent><p className="text-sm text-gray-600 leading-relaxed">{exam.description}</p></CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <p className="font-semibold text-gray-900">Questions</p>
        </CardHeader>
        <CardContent>
          <QuestionEditor examId={examId} questions={questions} onRefresh={fetchData} />
        </CardContent>
      </Card>
    </div>
  )
}
