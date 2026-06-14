'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewClassPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Class name is required'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: err } = await supabase
        .from('classes')
        .insert({ name: form.name.trim(), description: form.description.trim(), admin_id: user!.id })
        .select('id')
        .single()
      if (err) { setError(err.message); return }
      router.push(`/admin/classes/${data.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin/classes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Back to Classes
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Class</h1>
      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">A join code will be generated automatically for students to enrol.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Class Name"
              placeholder="e.g. Biology 101, Grade 10 Math"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Textarea
              label="Description (optional)"
              placeholder="Brief description of this class..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Create Class</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
