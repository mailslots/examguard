'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GoogleButtonProps {
  label?: string
  next?: string
}

export function GoogleButton({ label = 'Continue with Google', next }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
    if (next) callbackUrl.searchParams.set('next', next)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M47.53 24.56c0-1.67-.15-3.28-.43-4.83H24v9.14h13.2a11.3 11.3 0 0 1-4.9 7.41v6.16h7.93c4.64-4.27 7.3-10.57 7.3-17.88Z"/>
          <path fill="#34A853" d="M24 48c6.63 0 12.19-2.2 16.25-5.96l-7.93-6.16c-2.2 1.47-5 2.34-8.32 2.34-6.4 0-11.83-4.32-13.77-10.13H2.04v6.36A24 24 0 0 0 24 48Z"/>
          <path fill="#FBBC05" d="M10.23 28.09A14.4 14.4 0 0 1 9.48 24c0-1.42.24-2.8.75-4.09v-6.36H2.04A24 24 0 0 0 0 24c0 3.87.93 7.53 2.04 10.45l8.19-6.36Z"/>
          <path fill="#EA4335" d="M24 9.78c3.6 0 6.83 1.24 9.38 3.66l7.04-7.04C36.18 2.45 30.62 0 24 0A24 24 0 0 0 2.04 13.55l8.19 6.36C12.17 14.1 17.6 9.78 24 9.78Z"/>
        </svg>
      )}
      {label}
    </button>
  )
}
