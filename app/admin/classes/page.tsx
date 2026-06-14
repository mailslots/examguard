import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { Plus, Copy, Users, FileText } from 'lucide-react'

export default async function AdminClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from('classes')
    .select('*, class_enrollments(count), exams(count)')
    .eq('admin_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 mt-1">Manage your classes and their exams</p>
        </div>
        <Link
          href="/admin/classes/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} /> New Class
        </Link>
      </div>

      {(!classes || classes.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-1">No classes yet</p>
          <p className="text-gray-500 text-sm mb-6">Create your first class to get started</p>
          <Link href="/admin/classes/new" className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <Plus size={16} /> Create First Class
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => {
            const studentCount = Array.isArray(cls.class_enrollments) ? cls.class_enrollments[0]?.count ?? 0 : 0
            const examCount = Array.isArray(cls.exams) ? cls.exams[0]?.count ?? 0 : 0
            return (
              <Link key={cls.id} href={`/admin/classes/${cls.id}`}>
                <Card hover className="h-full">
                  <CardContent className="py-5">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{cls.name}</h3>
                    {cls.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{cls.description}</p>}
                    <div className="flex gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><Users size={12} /> {studentCount} students</span>
                      <span className="flex items-center gap-1"><FileText size={12} /> {examCount} exams</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <span className="text-xs font-mono font-medium text-gray-600">{cls.join_code}</span>
                        <Copy size={11} className="text-gray-400" />
                      </div>
                      <Badge variant="blue">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
