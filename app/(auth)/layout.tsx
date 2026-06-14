import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-xl">ExamGuard</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">{children}</main>
    </div>
  )
}
