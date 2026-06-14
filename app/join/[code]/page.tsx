'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react'

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'joining' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const join = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?next=/join/${code}`)
        return
      }

      setStatus('joining')

      // Find class by join code
      const { data: cls } = await supabase
        .from('classes')
        .select('id, name')
        .eq('join_code', code.toUpperCase())
        .single()

      if (!cls) {
        setStatus('error')
        setMessage('Invalid join code. Please check the link and try again.')
        return
      }

      // Enroll (ignore duplicate error)
      const { error } = await supabase
        .from('class_enrollments')
        .insert({ class_id: cls.id, student_id: user.id })

      if (error && error.code !== '23505') {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
        return
      }

      setStatus('done')
      setMessage(`You've joined ${cls.name}!`)
      setTimeout(() => router.push('/student/dashboard'), 1500)
    }

    join()
  }, [code, router, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-sm w-full p-8 text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Exaon</h1>

        {(status === 'loading' || status === 'joining') && (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mt-6 mb-4" />
            <p className="text-gray-500 text-sm">
              {status === 'loading' ? 'Checking your session…' : 'Joining class…'}
            </p>
          </>
        )}

        {status === 'done' && (
          <>
            <CheckCircle size={40} className="text-green-500 mx-auto mt-4 mb-3" />
            <p className="text-gray-700 font-medium">{message}</p>
            <p className="text-gray-400 text-sm mt-1">Redirecting to your dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertTriangle size={40} className="text-red-500 mx-auto mt-4 mb-3" />
            <p className="text-gray-700 font-medium">Couldn&apos;t join class</p>
            <p className="text-gray-400 text-sm mt-1">{message}</p>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="mt-5 text-sm text-blue-600 hover:underline"
            >
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
