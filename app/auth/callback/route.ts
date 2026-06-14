import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: profile } = await supabase.from('profiles').select('role').single()
      const destination = profile?.role === 'admin' ? '/admin' : '/student/dashboard'
      return NextResponse.redirect(new URL(destination, origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth', origin))
}
