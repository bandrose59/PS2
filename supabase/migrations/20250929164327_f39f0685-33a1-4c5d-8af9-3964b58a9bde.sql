-- Create comprehensive database schema for student placement platform

-- Projects table for student portfolios
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(user_id) NOT NULL,
  title text NOT NULL,
  description text,
  tech_stack text[],
  github_url text,
  live_url text,
  start_date date,
  end_date date,
  status text CHECK (status IN ('ongoing', 'completed', 'paused')) DEFAULT 'ongoing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text, -- technical, soft, language, etc.
  created_at timestamptz DEFAULT now()
);

-- Student skills junction table
CREATE TABLE IF NOT EXISTS public.student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(user_id) NOT NULL,
  skill_id uuid REFERENCES public.skills(id) NOT NULL,
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

-- Certifications table
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(user_id) NOT NULL,
  title text NOT NULL,
  issuing_organization text NOT NULL,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job opportunities table
CREATE TABLE IF NOT EXISTS public.job_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid REFERENCES public.profiles(user_id) NOT NULL,
  title text NOT NULL,
  company_name text NOT NULL,
  job_type text CHECK (job_type IN ('internship', 'full-time', 'part-time', 'contract')) NOT NULL,
  location text,
  location_type text CHECK (location_type IN ('on-site', 'remote', 'hybrid')) DEFAULT 'on-site',
  description text NOT NULL,
  required_skills text[],
  preferred_skills text[],
  min_gpa numeric(3,2),
  min_experience_months integer DEFAULT 0,
  stipend_min integer,
  stipend_max integer,
  conversion_chance text CHECK (conversion_chance IN ('high', 'medium', 'low')),
  application_deadline date,
  start_date date,
  duration_months integer,
  status text CHECK (status IN ('draft', 'active', 'closed', 'cancelled')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(user_id) NOT NULL,
  job_id uuid REFERENCES public.job_opportunities(id) NOT NULL,
  status text CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected')) DEFAULT 'applied',
  cover_letter text,
  resume_url text,
  mentor_feedback text,
  recruiter_feedback text,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, job_id)
);

-- Achievements/Badges table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.profiles(user_id) NOT NULL,
  title text NOT NULL,
  description text,
  badge_type text CHECK (badge_type IN ('academic', 'project', 'skill', 'competition', 'certification', 'leadership')) NOT NULL,
  points integer DEFAULT 0,
  issued_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Interview scheduling table
CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) NOT NULL,
  interviewer_id uuid REFERENCES public.profiles(user_id),
  interview_type text CHECK (interview_type IN ('technical', 'hr', 'group', 'final')) NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_link text,
  status text CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled')) DEFAULT 'scheduled',
  feedback text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Mentors and recruiters can view student projects" ON public.projects FOR SELECT USING (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'recruiter') OR 
  public.has_role(auth.uid(), 'tnp')
);

-- Skills policies (read-only for most users)
CREATE POLICY "Everyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin can manage skills" ON public.skills FOR ALL USING (public.has_role(auth.uid(), 'tnp'));

-- Student skills policies
CREATE POLICY "Users can manage own skills" ON public.student_skills FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Others can view student skills" ON public.student_skills FOR SELECT USING (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'recruiter') OR 
  public.has_role(auth.uid(), 'tnp')
);

-- Certifications policies
CREATE POLICY "Users can manage own certifications" ON public.certifications FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Others can view certifications" ON public.certifications FOR SELECT USING (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'recruiter') OR 
  public.has_role(auth.uid(), 'tnp')
);

-- Job opportunities policies
CREATE POLICY "Everyone can view active jobs" ON public.job_opportunities FOR SELECT USING (status = 'active');
CREATE POLICY "TnP and recruiters can manage jobs" ON public.job_opportunities FOR ALL USING (
  public.has_role(auth.uid(), 'tnp') OR 
  public.has_role(auth.uid(), 'recruiter')
);

-- Applications policies
CREATE POLICY "Students can view own applications" ON public.applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Staff can view all applications" ON public.applications FOR SELECT USING (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'recruiter') OR 
  public.has_role(auth.uid(), 'tnp')
);
CREATE POLICY "Staff can update applications" ON public.applications FOR UPDATE USING (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'recruiter') OR 
  public.has_role(auth.uid(), 'tnp')
);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admin can manage achievements" ON public.achievements FOR ALL USING (public.has_role(auth.uid(), 'tnp'));

-- Interviews policies
CREATE POLICY "Related users can view interviews" ON public.interviews FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a 
    WHERE a.id = application_id AND (
      a.student_id = auth.uid() OR 
      interviewer_id = auth.uid() OR
      public.has_role(auth.uid(), 'tnp')
    )
  )
);
CREATE POLICY "Staff can manage interviews" ON public.interviews FOR ALL USING (
  public.has_role(auth.uid(), 'mentor') OR 
  public.has_role(auth.uid(), 'recruiter') OR 
  public.has_role(auth.uid(), 'tnp')
);

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_opportunities_updated_at BEFORE UPDATE ON public.job_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default skills
INSERT INTO public.skills (name, category) VALUES
('JavaScript', 'technical'),
('Python', 'technical'),
('Java', 'technical'),
('React', 'technical'),
('Node.js', 'technical'),
('SQL', 'technical'),
('Communication', 'soft'),
('Leadership', 'soft'),
('Problem Solving', 'soft'),
('Teamwork', 'soft')
ON CONFLICT (name) DO NOTHING;