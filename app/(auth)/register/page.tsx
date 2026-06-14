'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { GoogleButton } from '@/components/ui/GoogleButton'
import { Mail } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()
  const [showTeacherInfo, setShowTeacherInfo] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName, role: 'student' } },
      })
      if (authError) { setError(authError.message); return }
      router.push('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-1 text-sm">Join Exaon as a student</p>
      </div>

      <Card>
        <CardContent className="py-6">
          <GoogleButton label="Sign up with Google" />
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="new-password"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Student Account
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Teacher account info */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowTeacherInfo(v => !v)}
          className="w-full text-center text-sm text-gray-500 hover:text-blue-600 transition-colors py-2"
        >
          Are you a teacher?
        </button>
        {showTeacherInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2 text-center">
            <p className="text-sm text-blue-800 font-medium mb-1">Teacher accounts are by invitation only</p>
            <p className="text-sm text-blue-600 mb-3">Contact the platform administrator to request access.</p>
            <a
              href="mailto:mailslots@gmail.com"
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail size={14} />
              Contact Phubet Chitapanya
            </a>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
