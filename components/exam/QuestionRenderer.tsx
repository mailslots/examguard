'use client'

import type { Question, Answer } from '@/types'
import { Textarea } from '@/components/ui/Input'

interface QuestionRendererProps {
  question: Question
  index: number
  answer: Partial<Answer> | undefined
  onChange: (questionId: string, update: Partial<Answer>) => void
}

export function QuestionRenderer({ question, index, answer, onChange }: QuestionRendererProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-gray-900 font-medium leading-relaxed text-base">{question.text}</p>
          <p className="text-xs text-gray-400 mt-1">{question.points} point{question.points !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {question.type === 'mcq' && question.question_options && (
        <div className="space-y-2 ml-11">
          {question.question_options.map(opt => {
            const selected = answer?.selected_option_id === opt.id
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
                  name={question.id}
                  value={opt.id}
                  checked={selected}
                  onChange={() => onChange(question.id, { selected_option_id: opt.id, text_answer: null })}
                  className="sr-only"
                />
                <span className={`text-sm ${selected ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>{opt.text}</span>
              </label>
            )
          })}
        </div>
      )}

      {(question.type === 'short_answer' || question.type === 'essay') && (
        <div className="ml-11">
          <Textarea
            placeholder={question.type === 'short_answer' ? 'Type your answer here...' : 'Write your essay here...'}
            rows={question.type === 'essay' ? 8 : 3}
            value={answer?.text_answer ?? ''}
            onChange={e => onChange(question.id, { text_answer: e.target.value, selected_option_id: null })}
          />
        </div>
      )}
    </div>
  )
}
