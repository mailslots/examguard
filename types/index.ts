export type Role = 'admin' | 'student'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  created_at: string
}

export interface Class {
  id: string
  name: string
  description: string
  admin_id: string
  join_code: string
  created_at: string
  _count?: { students: number; exams: number }
}

export interface ClassEnrollment {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
  profiles?: Profile
  classes?: Class
}

export interface Exam {
  id: string
  class_id: string
  title: string
  description: string
  duration_minutes: number
  max_warnings: number
  is_published: boolean
  shuffle_questions: boolean
  created_at: string
  classes?: Pick<Class, 'name'>
  _count?: { questions: number }
}

export type QuestionType = 'mcq' | 'short_answer' | 'essay'

export interface Question {
  id: string
  exam_id: string
  type: QuestionType
  text: string
  points: number
  order_index: number
  created_at: string
  question_options?: QuestionOption[]
}

export interface QuestionOption {
  id: string
  question_id: string
  text: string
  is_correct: boolean
  order_index: number
}

export type AttemptStatus = 'in_progress' | 'submitted' | 'auto_submitted'

export interface ExamAttempt {
  id: string
  exam_id: string
  student_id: string
  started_at: string
  submitted_at: string | null
  score: number | null
  max_score: number | null
  cheat_count: number
  status: AttemptStatus
  profiles?: Profile
  exams?: Exam
}

export interface Answer {
  id: string
  attempt_id: string
  question_id: string
  selected_option_id: string | null
  text_answer: string | null
  is_correct: boolean | null
  points_earned: number
}

export type CheatEventType = 'tab_switch' | 'copy_attempt' | 'fullscreen_exit' | 'window_blur' | 'right_click' | 'keyboard_shortcut'

export interface CheatEvent {
  id: string
  attempt_id: string
  event_type: CheatEventType
  occurred_at: string
}
