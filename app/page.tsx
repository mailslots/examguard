import Link from 'next/link'
import { ShieldCheck, Clock, BarChart3, Smartphone, BookOpen, AlertTriangle } from 'lucide-react'

const features = [
  { icon: ShieldCheck, title: 'Anti-Cheat Detection', desc: 'Tracks tab switches, copy attempts, fullscreen exits, and more — automatically.' },
  { icon: Clock, title: 'Timed Exams', desc: 'Set duration per exam. Auto-submit when time runs out, no exceptions.' },
  { icon: BarChart3, title: 'Instant Results', desc: 'Auto-grade MCQs. View scores and full cheat event logs per student.' },
  { icon: Smartphone, title: 'Works Everywhere', desc: 'Fully responsive — works on mobile, tablet, and desktop.' },
  { icon: BookOpen, title: 'Class Management', desc: 'Create classes, share a join code, and manage students and exams easily.' },
  { icon: AlertTriangle, title: 'Warning System', desc: 'Students get warnings on violations. Exam auto-submits after the limit.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-xl">Exaon</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <ShieldCheck size={14} />
            Secure Exam Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Online Exams,<br />
            <span className="text-blue-600">Zero Compromises</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace Google Forms with a platform built for integrity. Detect cheating in real time — tab switches, copy attempts, and more — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register?role=admin" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors text-base">
              Start as Teacher
            </Link>
            <Link href="/register?role=student" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-medium px-8 py-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-base">
              Join as Student
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to run fair exams</h2>
            <p className="text-gray-500 text-lg">Built for teachers who care about academic integrity</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to run your first secure exam?</h2>
          <p className="text-blue-100 text-lg mb-8">Create a class, add your questions, and share the join code with students.</p>
          <Link href="/register?role=admin" className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-base">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <ShieldCheck size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Exaon</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Exaon. Built for academic integrity.</p>
        </div>
      </footer>
    </div>
  )
}
