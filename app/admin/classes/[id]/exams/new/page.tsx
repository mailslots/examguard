'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewExamPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.id as string
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', description: '', duration_minutes: 60, max_warnings: 3, shuffle_questions: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Exam title is required'); return }
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('exams')
        .insert({ ...form, title: form.title.trim(), class_id: classId })
        .select('id')
        .single()
      if (err) { setError(err.message); return }
      router.push(`/admin/exams/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href={`/admin/classes/${classId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to Class
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Exam</h1>
      <Card>
        <CardHeader><p className="text-sm text-gray-500">You can add questions after creating the exam.</p></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Exam Title"
              placeholder="e.g. Mid-Term Exam, Chapter 3 Quiz"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Textarea
              label="Instructions (optional)"
              placeholder="Instructions shown to students before starting..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                min={5}
                max={480}
                value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
              />
              <Input
                label="Max Cheat Warnings"
                type="number"
                min={1}
                max={10}
                value={form.max_warnings}
                onChange={e => setForm(f => ({ ...f, max_warnings: Number(e.target.value) }))}
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.shuffle_questions}
                onChange={e => setForm(f => ({ ...f, shuffle_questions: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Shuffle question order for each student</span>
            </label>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Create Exam</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
