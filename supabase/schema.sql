-- ============================================================
-- ExamGuard Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  join_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage their classes" ON public.classes FOR ALL USING (admin_id = auth.uid());
CREATE POLICY "Students view enrolled classes" ON public.classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_enrollments WHERE class_id = id AND student_id = auth.uid())
);

-- Class enrollments
CREATE TABLE public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage enrollments" ON public.class_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND admin_id = auth.uid())
);
CREATE POLICY "Students view own enrollments" ON public.class_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can enroll" ON public.class_enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can unenroll" ON public.class_enrollments FOR DELETE USING (student_id = auth.uid());

-- Exams
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_warnings INTEGER NOT NULL DEFAULT 3,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage exams" ON public.exams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND admin_id = auth.uid())
);
CREATE POLICY "Students view published exams" ON public.exams FOR SELECT USING (
  is_published = TRUE AND
  EXISTS (SELECT 1 FROM public.class_enrollments WHERE class_id = exams.class_id AND student_id = auth.uid())
);

-- Questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'mcq' CHECK (type IN ('mcq', 'short_answer', 'essay')),
  text TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage questions" ON public.questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.exams e JOIN public.classes c ON c.id = e.class_id WHERE e.id = exam_id AND c.admin_id = auth.uid())
);
CREATE POLICY "Students view questions during attempt" ON public.questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exam_attempts WHERE exam_id = questions.exam_id AND student_id = auth.uid() AND status = 'in_progress')
);

-- Question options (MCQ)
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage options" ON public.question_options FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.questions q JOIN public.exams e ON e.id = q.exam_id JOIN public.classes c ON c.id = e.class_id
    WHERE q.id = question_id AND c.admin_id = auth.uid()
  )
);
CREATE POLICY "Students view options during attempt" ON public.question_options FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.questions q JOIN public.exam_attempts a ON a.exam_id = q.exam_id
    WHERE q.id = question_id AND a.student_id = auth.uid() AND a.status = 'in_progress'
  )
);

-- Exam attempts
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  max_score NUMERIC,
  cheat_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'auto_submitted')),
  UNIQUE(exam_id, student_id)
);
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own attempts" ON public.exam_attempts FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admins view attempts" ON public.exam_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exams e JOIN public.classes c ON c.id = e.class_id WHERE e.id = exam_id AND c.admin_id = auth.uid())
);

-- Answers
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id UUID REFERENCES public.question_options(id),
  text_answer TEXT,
  is_correct BOOLEAN,
  points_earned NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own answers" ON public.answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND student_id = auth.uid())
);
CREATE POLICY "Admins view answers" ON public.answers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts a JOIN public.exams e ON e.id = a.exam_id JOIN public.classes c ON c.id = e.class_id
    WHERE a.id = attempt_id AND c.admin_id = auth.uid()
  )
);

-- Cheat events
CREATE TABLE public.cheat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('tab_switch', 'copy_attempt', 'fullscreen_exit', 'window_blur', 'right_click', 'keyboard_shortcut')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.cheat_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own cheat events" ON public.cheat_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND student_id = auth.uid())
);
CREATE POLICY "Admins view cheat events" ON public.cheat_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.exam_attempts a JOIN public.exams e ON e.id = a.exam_id JOIN public.classes c ON c.id = e.class_id
    WHERE a.id = attempt_id AND c.admin_id = auth.uid()
  )
);
CREATE POLICY "Students view own cheat events" ON public.cheat_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exam_attempts WHERE id = attempt_id AND student_id = auth.uid())
);
