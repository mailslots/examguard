import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Users, BookOpen, FileText, ArrowRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: myClasses, count: classCount } = await supabase
    .from('classes')
    .select('id', { count: 'exact' })
    .eq('admin_id', user!.id)

  const classIds = myClasses?.map(c => c.id) ?? []

  const [{ count: examCount }, { count: studentCount }] = await Promise.all([
    classIds.length > 0
      ? supabase.from('exams').select('*', { count: 'exact', head: true }).in('class_id', classIds)
      : Promise.resolve({ count: 0 }),
    classIds.length > 0
      ? supabase.from('class_enrollments').select('*', { count: 'exact', head: true }).in('class_id', classIds)
      : Promise.resolve({ count: 0 }),
  ])

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()

  const stats = [
    { label: 'Classes', value: classCount ?? 0, icon: Users, color: 'bg-blue-100 text-blue-600', href: '/admin/classes' },
    { label: 'Exams', value: examCount ?? 0, icon: FileText, color: 'bg-purple-100 text-purple-600', href: '/admin/classes' },
    { label: 'Students', value: studentCount ?? 0, icon: BookOpen, color: 'bg-green-100 text-green-600', href: '/admin/classes' },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'Teacher'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your classes and exams.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card hover>
              <CardContent className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/classes/new">
          <Card hover>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Create New Class</p>
                <p className="text-sm text-gray-500 mt-0.5">Set up a class and invite students</p>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/classes">
          <Card hover>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Manage Classes</p>
                <p className="text-sm text-gray-500 mt-0.5">View classes, exams, and results</p>
              </div>
              <ArrowRight size={18} className="text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
