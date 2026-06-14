'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Exam, Class, ExamAttempt } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { Clock, BookOpen, Plus, AlertTriangle } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

type ExamWithClass = Exam & { classes: Pick<Class, 'name'> }
type AttemptMap = Record<string, ExamAttempt>

export default function StudentDashboard() {
  const supabase = createClient()
  const [exams, setExams] = useState<ExamWithClass[]>([])
  const [attempts, setAttempts] = useState<AttemptMap>({})
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: enrollments } = await supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_id', user.id)

    const classIds = enrollments?.map(e => e.class_id) ?? []

    if (classIds.length > 0) {
      const { data: examList } = await supabase
        .from('exams')
        .select('*, classes(name)')
        .in('class_id', classIds)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setExams((examList as ExamWithClass[]) ?? [])

      if (examList && examList.length > 0) {
        const { data: attemptList } = await supabase
          .from('exam_attempts')
          .select('*')
          .eq('student_id', user.id)
          .in('exam_id', examList.map(e => e.id))

        const map: AttemptMap = {}
        attemptList?.forEach(a => { map[a.exam_id] = a })
        setAttempts(map)
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleJoin = async () => {
    setJoinError('')
    if (!joinCode.trim()) return
    setJoinLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: cls } = await supabase.from('classes').select('id').eq('join_code', joinCode.trim().toUpperCase()).single()
      if (!cls) { setJoinError('Class not found. Check the code and try again.'); return }

      const { error } = await supabase.from('class_enrollments').insert({ class_id: cls.id, student_id: user!.id })
      if (error?.code === '23505') { setJoinError('You are already enrolled in this class.'); return }
      if (error) { setJoinError(error.message); return }

      setJoinOpen(false)
      setJoinCode('')
      fetchData()
    } finally {
      setJoinLoading(false)
    }
  }

  const getExamStatus = (exam: ExamWithClass) => {
    const attempt = attempts[exam.id]
    if (!attempt) return 'not_started'
    return attempt.status
  }

  if (loading) return <div className="text-gray-400 py-20 text-center">Loading your dashboard...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Available exams from your classes</p>
        </div>
        <Button onClick={() => setJoinOpen(true)} variant="outline">
          <Plus size={16} /> Join Class
        </Button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <p className="font-semibold text-gray-900 text-lg mb-1">No exams yet</p>
          <p className="text-gray-500 text-sm mb-6">Join a class using the code your teacher gave you</p>
          <Button onClick={() => setJoinOpen(true)}><Plus size={16} /> Join a Class</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(exam => {
            const status = getExamStatus(exam)
            const attempt = attempts[exam.id]
            return (
              <Card key={exam.id} className="flex flex-col">
                <CardContent className="flex-1 py-5">
                  <p className="text-xs text-blue-600 font-medium mb-1">{exam.classes.name}</p>
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">{exam.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(exam.duration_minutes)}</span>
                    <span className="flex items-center gap-1"><AlertTriangle size={12} /> {exam.max_warnings} warnings max</span>
                  </div>
                  {status === 'not_started' && (
                    <Link href={`/exam/${exam.id}`}>
                      <Button className="w-full" size="sm">Start Exam</Button>
                    </Link>
                  )}
                  {status === 'in_progress' && (
                    <Link href={`/exam/${exam.id}`}>
                      <Button className="w-full" size="sm" variant="secondary">Resume Exam</Button>
                    </Link>
                  )}
                  {(status === 'submitted' || status === 'auto_submitted') && (
                    <div className="space-y-2">
                      <Badge variant={status === 'auto_submitted' ? 'warning' : 'success'} className="w-full justify-center py-1.5 text-xs">
                        {status === 'auto_submitted' ? 'Auto-Submitted' : 'Completed'}
                      </Badge>
                      {attempt?.score !== null && (
                        <p className="text-center text-sm text-gray-600">
                          Score: <span className="font-bold text-gray-900">{attempt.score}/{attempt.max_score}</span>
                        </p>
                      )}
                      <Link href={`/exam/${exam.id}/complete`}>
                        <Button variant="ghost" size="sm" className="w-full">View Results</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={joinOpen} onClose={() => { setJoinOpen(false); setJoinError('') }} title="Join a Class">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter the class code your teacher shared with you.</p>
          <Input
            label="Class Code"
            placeholder="e.g. ABCD1234"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="font-mono uppercase text-lg tracking-widest"
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          {joinError && <p className="text-sm text-red-500">{joinError}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleJoin} loading={joinLoading} className="flex-1">Join Class</Button>
            <Button variant="ghost" onClick={() => setJoinOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
