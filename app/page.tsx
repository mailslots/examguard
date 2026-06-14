import Link from 'next/link'
import { ShieldCheck, Clock, BarChart3, Smartphone, BookOpen, AlertTriangle, CheckCircle2, ChevronRight, Users, FileQuestion } from 'lucide-react'

const features = [
  { icon: ShieldCheck, title: 'Anti-Cheat Detection', desc: 'Tracks tab switches, copy attempts, fullscreen exits, and more — automatically.' },
  { icon: Clock, title: 'Timed Exams', desc: 'Set duration per exam. Auto-submit when time runs out, no exceptions.' },
  { icon: BarChart3, title: 'Instant Results', desc: 'Auto-grade MCQs. View scores and full cheat event logs per student.' },
  { icon: Smartphone, title: 'Works Everywhere', desc: 'Fully responsive — works on mobile, tablet, and desktop.' },
  { icon: BookOpen, title: 'Class Management', desc: 'Create classes, share a join code, and manage students and exams easily.' },
  { icon: AlertTriangle, title: 'Warning System', desc: 'Students get warnings on violations. Exam auto-submits after the limit.' },
]

const teacherSteps = [
  { n: '1', title: 'Create a class', desc: 'Give it a name and get a unique join code automatically.' },
  { n: '2', title: 'Add questions', desc: 'Multiple choice, short answer, or essay — set points and time limit.' },
  { n: '3', title: 'Share the link', desc: 'Copy the student invite link and send it via LINE, email, or any channel.' },
  { n: '4', title: 'View results', desc: 'See scores, answers, and a full cheat-event log per student.' },
]

const studentSteps = [
  { n: '1', title: 'Click the link', desc: 'Teacher shares a link — just click it, no code to type.' },
  { n: '2', title: 'Log in', desc: 'Sign in with Google or email. The app remembers you.' },
  { n: '3', title: 'Read the rules', desc: 'Anti-cheat rules are shown before you start. The screen goes fullscreen.' },
  { n: '4', title: 'Submit & done', desc: 'Timer counts down. Submit when ready — MCQs are graded instantly.' },
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

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">Simple for teachers, smooth for students</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teacher flow */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">For Teachers</p>
                  <p className="text-xs text-gray-400">Create &amp; manage exams</p>
                </div>
              </div>
              <div className="space-y-5">
                {teacherSteps.map(s => (
                  <div key={s.n} className="flex gap-4">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register?role=admin" className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                Create teacher account <ChevronRight size={15} />
              </Link>
            </div>

            {/* Student flow */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileQuestion size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">For Students</p>
                  <p className="text-xs text-gray-400">Join &amp; take exams</p>
                </div>
              </div>
              <div className="space-y-5">
                {studentSteps.map(s => (
                  <div key={s.n} className="flex gap-4">
                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register?role=student" className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700">
                Create student account <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Exam preview mockup */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What the exam looks like</h2>
            <p className="text-gray-500 text-lg">Students see a clean, distraction-free interface with a live timer and progress tracker</p>
          </div>

          {/* Browser chrome wrapper */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex-1 mx-4 bg-gray-700 rounded-md h-6 flex items-center px-3">
                <span className="text-gray-400 text-xs">exaon.vercel.app/exam/…</span>
              </div>
              <div className="w-3 h-3 bg-gray-600 rounded-full" />
            </div>

            {/* Mock exam UI */}
            <div className="bg-gray-50">
              {/* Top bar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                    <ShieldCheck size={12} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Introduction to AI — Midterm</p>
                    <p className="text-xs text-gray-400">3 of 10 answered</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
                    <Clock size={13} className="text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">42:17</span>
                  </div>
                  <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">Submit</div>
                </div>
              </div>

              <div className="flex gap-4 p-4 sm:p-6">
                {/* Question card */}
                <div className="flex-1 space-y-4">
                  {/* Q1 - answered */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="w-6 h-6 bg-blue-600 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Which of the following best describes machine learning?</p>
                        <p className="text-xs text-gray-400 mt-0.5">2 points · Multiple choice</p>
                      </div>
                    </div>
                    <div className="space-y-2 pl-9">
                      {[
                        { label: 'A', text: 'Programming rules manually for every case', selected: false },
                        { label: 'B', text: 'Teaching computers to learn from data and improve over time', selected: true },
                        { label: 'C', text: 'Storing large amounts of data in databases', selected: false },
                        { label: 'D', text: 'Connecting computers via the internet', selected: false },
                      ].map(o => (
                        <div key={o.label} className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm transition-colors ${o.selected ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-gray-200 text-gray-600'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${o.selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {o.selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="font-medium text-xs mr-1">{o.label}.</span>
                          {o.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q2 unanswered */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5 opacity-75">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="w-6 h-6 bg-gray-200 rounded-full text-gray-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">What does &quot;neural network&quot; refer to?</p>
                        <p className="text-xs text-gray-400 mt-0.5">2 points · Multiple choice</p>
                      </div>
                    </div>
                    <div className="space-y-2 pl-9">
                      {['A network of physical computers', 'A model inspired by the human brain\'s neurons', 'A type of database structure', 'An internet routing protocol'].map((text, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                          <span className="font-medium text-xs mr-1">{String.fromCharCode(65+i)}.</span>
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question navigator */}
                <div className="hidden sm:block w-40 shrink-0">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Questions</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center ${i < 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">3 of 10 done</p>
                  </div>

                  {/* Anti-cheat badge */}
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck size={12} className="text-orange-500" />
                      <p className="text-xs font-semibold text-orange-700">Anti-Cheat</p>
                    </div>
                    <p className="text-xs text-orange-600">Fullscreen · No copy · No tab switch</p>
                    <div className="mt-2 flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 0 ? 'bg-orange-400' : 'bg-orange-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-orange-400 mt-1">0 of 3 warnings used</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-sm text-gray-400 mt-4 flex items-center justify-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" />
            Fullscreen mode · Copy &amp; paste disabled · Timer running · All violations logged
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
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
          <p className="text-blue-100 text-lg mb-8">Create a class, add your questions, and share the invite link with students.</p>
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
