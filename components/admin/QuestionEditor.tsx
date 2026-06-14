'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Question, QuestionType } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Trash2, GripVertical, Check } from 'lucide-react'

interface QuestionEditorProps {
  examId: string
  questions: Question[]
  onRefresh: () => void
}

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  short_answer: 'Short Answer',
  essay: 'Essay',
}

export function QuestionEditor({ examId, questions, onRefresh }: QuestionEditorProps) {
  const supabase = createClient()
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'mcq' as QuestionType, text: '', points: 1 })
  const [options, setOptions] = useState([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ])

  const resetForm = () => {
    setForm({ type: 'mcq', text: '', points: 1 })
    setOptions([
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ])
    setAdding(false)
  }

  const saveQuestion = async () => {
    if (!form.text.trim()) return
    setSaving(true)
    try {
      const { data: q, error } = await supabase
        .from('questions')
        .insert({ exam_id: examId, type: form.type, text: form.text, points: form.points, order_index: questions.length })
        .select('id')
        .single()
      if (error || !q) throw error

      if (form.type === 'mcq') {
        const validOptions = options.filter(o => o.text.trim())
        if (validOptions.length >= 2) {
          await supabase.from('question_options').insert(
            validOptions.map((o, i) => ({ question_id: q.id, text: o.text, is_correct: o.is_correct, order_index: i }))
          )
        }
      }
      resetForm()
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  const deleteQuestion = async (id: string) => {
    await supabase.from('questions').delete().eq('id', id)
    onRefresh()
  }

  const setCorrect = (index: number) => {
    setOptions(opts => opts.map((o, i) => ({ ...o, is_correct: i === index })))
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 && !adding && (
        <div className="text-center py-12 text-gray-500">
          <p className="font-medium">No questions yet</p>
          <p className="text-sm mt-1">Add your first question below</p>
        </div>
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <GripVertical size={16} className="text-gray-300 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500">Q{idx + 1}</span>
                <Badge variant="blue">{TYPE_LABELS[q.type]}</Badge>
                <Badge variant="default">{q.points} pt{q.points !== 1 ? 's' : ''}</Badge>
              </div>
              <button onClick={() => deleteQuestion(q.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
            <p className="text-sm text-gray-800 mt-2 leading-relaxed">{q.text}</p>
            {q.question_options && q.question_options.length > 0 && (
              <div className="mt-2 space-y-1">
                {q.question_options.map(opt => (
                  <div key={opt.id} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${opt.is_correct ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}>
                    {opt.is_correct && <Check size={12} />}
                    {!opt.is_correct && <span className="w-3" />}
                    {opt.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {adding && (
        <div className="p-5 border-2 border-blue-200 rounded-xl bg-blue-50/30 space-y-4">
          <div className="flex gap-3 flex-wrap">
            {(['mcq', 'short_answer', 'essay'] as QuestionType[]).map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <Textarea
            label="Question Text"
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder="Enter your question..."
            rows={3}
          />

          <Input
            label="Points"
            type="number"
            min={1}
            value={form.points}
            onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
            className="w-32"
          />

          {form.type === 'mcq' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Answer Options <span className="text-gray-400 font-normal">(click circle to mark correct)</span></p>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrect(i)}
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${opt.is_correct ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'}`}
                  >
                    {opt.is_correct && <Check size={10} className="text-white" />}
                  </button>
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt.text}
                    onChange={e => {
                      const newOpts = [...options]
                      newOpts[i] = { ...newOpts[i], text: e.target.value }
                      setOptions(newOpts)
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={saveQuestion} loading={saving} size="sm">Save Question</Button>
            <Button onClick={resetForm} variant="ghost" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {!adding && (
        <Button onClick={() => setAdding(true)} variant="outline" className="w-full">
          <Plus size={16} /> Add Question
        </Button>
      )}
    </div>
  )
}
