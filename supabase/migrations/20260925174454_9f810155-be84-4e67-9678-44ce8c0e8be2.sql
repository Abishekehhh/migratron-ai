CREATE TABLE public.migration_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'planning', 'refactoring', 'validating', 'completed', 'failed')),
  cobol_source TEXT NOT NULL,
  java_output TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, owner_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.migration_jobs TO authenticated;
GRANT ALL ON public.migration_jobs TO service_role;
ALTER TABLE public.migration_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their migration jobs" ON public.migration_jobs FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.migration_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  phase_name TEXT NOT NULL,
  phase_order INTEGER NOT NULL CHECK (phase_order > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  bob_session_id TEXT,
  output TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (job_id, owner_id) REFERENCES public.migration_jobs(id, owner_id) ON DELETE CASCADE,
  UNIQUE (job_id, phase_order)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.migration_phases TO authenticated;
GRANT ALL ON public.migration_phases TO service_role;
ALTER TABLE public.migration_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their migration phases" ON public.migration_phases FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.impact_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  affected_program TEXT NOT NULL,
  impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (job_id, owner_id) REFERENCES public.migration_jobs(id, owner_id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.impact_analysis TO authenticated;
GRANT ALL ON public.impact_analysis TO service_role;
ALTER TABLE public.impact_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their impact analysis" ON public.impact_analysis FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.bob_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('ask', 'plan', 'agent', 'subagent')),
  prompt TEXT NOT NULL,
  response TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (job_id, owner_id) REFERENCES public.migration_jobs(id, owner_id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bob_sessions TO authenticated;
GRANT ALL ON public.bob_sessions TO service_role;
ALTER TABLE public.bob_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their Bob sessions" ON public.bob_sessions FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_migration_jobs_updated_at BEFORE UPDATE ON public.migration_jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_migration_phases_updated_at BEFORE UPDATE ON public.migration_phases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_impact_analysis_updated_at BEFORE UPDATE ON public.impact_analysis FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_bob_sessions_updated_at BEFORE UPDATE ON public.bob_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();