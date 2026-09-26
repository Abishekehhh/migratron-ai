import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  Code2,
  FileCode2,
  GitBranch,
  Layers3,
  LoaderCircle,
  LogOut,
  Play,
  Plus,
  ShieldCheck,
  TerminalSquare,
  TriangleAlert,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Job = Tables<"migration_jobs">;
type Phase = Tables<"migration_phases">;
type Impact = Tables<"impact_analysis">;
type ViewFilter = "all" | "active" | "completed";

const phaseNames = ["Analysis", "Migration plan", "Refactoring", "Validation"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LegacyPilot — Legacy Code Migration Workspace" },
      {
        name: "description",
        content:
          "Prepare and track COBOL modernization work with a private workspace for source, migration phases, and impact findings.",
      },
      { property: "og:title", content: "LegacyPilot — Legacy Code Migration Workspace" },
      {
        property: "og:description",
        content: "A focused workspace for planning and tracking COBOL modernization.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegacyPilot,
});

function LegacyPilot() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [jobName, setJobName] = useState("");
  const [source, setSource] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const jobsRef = useRef<Job[]>([]);
  jobsRef.current = jobs;

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setJobs([]);
      setPhases([]);
      setImpacts([]);
      setSelectedId(null);
      setIsLoadingJobs(false);
      return;
    }

    let cancelled = false;
    setIsLoadingJobs(true);
    setWorkspaceError("");
    void Promise.all([
      supabase.from("migration_jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("migration_phases").select("*").order("phase_order", { ascending: true }),
      supabase.from("impact_analysis").select("*").order("created_at", { ascending: false }),
    ]).then(([jobsResult, phasesResult, impactsResult]) => {
      if (cancelled) return;
      const error = jobsResult.error ?? phasesResult.error ?? impactsResult.error;
      if (error) {
        setWorkspaceError(error.message);
      } else {
        const nextJobs = jobsResult.data ?? [];
        setJobs(nextJobs);
        setPhases(phasesResult.data ?? []);
        setImpacts(impactsResult.data ?? []);
        setSelectedId((current) => current && nextJobs.some((job) => job.id === current) ? current : nextJobs[0]?.id ?? null);
      }
      setIsLoadingJobs(false);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setWorkspaceError(error instanceof Error ? error.message : "Unable to load your workspace.");
      setIsLoadingJobs(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null;
  const visibleJobs = useMemo(() => jobs.filter((job) => {
    if (filter === "active") return !["completed", "failed"].includes(job.status);
    if (filter === "completed") return job.status === "completed";
    return true;
  }), [filter, jobs]);
  const selectedPhases = selectedJob ? phases.filter((phase) => phase.job_id === selectedJob.id) : [];
  const selectedImpacts = selectedJob ? impacts.filter((impact) => impact.job_id === selectedJob.id) : [];
  const activeCount = jobs.filter((job) => !["completed", "failed"].includes(job.status)).length;
  const completeCount = jobs.filter((job) => job.status === "completed").length;

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const result = authMode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setAuthBusy(false);
    if (result.error) {
      setAuthMessage(result.error.message);
    } else if (authMode === "signup" && !result.data.session) {
      setAuthMessage("Check your inbox for a confirmation link, then sign in.");
    }
  }

  async function signInWithGoogle() {
    setAuthBusy(true);
    setAuthMessage("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setAuthMessage(result.error.message);
      setAuthBusy(false);
    }
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const name = jobName.trim();
    const code = source.trim();
    if (!name || !code) return;
    if (code.length > 500_000) {
      setWorkspaceError("Keep each COBOL source file under 500,000 characters.");
      return;
    }

    setIsCreating(true);
    setWorkspaceError("");
    const jobInput: TablesInsert<"migration_jobs"> = {
      owner_id: user.id,
      name,
      cobol_source: code,
      status: "pending",
      progress: 0,
    };
    const { data: newJob, error } = await supabase.from("migration_jobs").insert(jobInput).select("*").single();
    if (error || !newJob) {
      setWorkspaceError(error?.message ?? "Could not save this migration.");
      setIsCreating(false);
      return;
    }

    const phaseRows: TablesInsert<"migration_phases">[] = phaseNames.map((phaseName, index) => ({
      job_id: newJob.id,
      owner_id: user.id,
      phase_name: phaseName,
      phase_order: index + 1,
      status: "pending",
    }));
    const { data: newPhases, error: phaseError } = await supabase.from("migration_phases").insert(phaseRows).select("*");
    setJobs((current) => [newJob, ...current]);
    if (newPhases) setPhases((current) => [...current, ...newPhases]);
    setSelectedId(newJob.id);
    setJobName("");
    setSource("");
    setShowComposer(false);
    if (phaseError) {
      setWorkspaceError(`Migration saved, but its phase checklist could not be created: ${phaseError.message}`);
    }
    setIsCreating(false);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setWorkspaceError(error.message);
  }

  if (!authReady) {
    return <div className="grid min-h-screen place-items-center bg-background"><LoaderCircle className="size-6 animate-spin text-primary" aria-label="Loading" /></div>;
  }

  if (!user) {
    return <main className="auth-screen"><div className="auth-grid" aria-hidden="true" />
      <section className="auth-panel">
        <Brand />
        <div className="auth-copy"><span className="eyebrow">MAINFRAME MODERNIZATION</span><h1>Move legacy forward.</h1><p>A private workspace to understand your COBOL, organize migration work, and track what changes.</p></div>
        <div className="auth-rule"><ShieldCheck size={16} /><span>Your source code stays in your private workspace.</span></div>
        <form className="auth-form" onSubmit={submitAuth}>
          <div className="auth-heading"><h2>{authMode === "signin" ? "Welcome back" : "Create your workspace"}</h2><p>{authMode === "signin" ? "Sign in to continue to LegacyPilot." : "Your account is private by default."}</p></div>
          <label className="field-label" htmlFor="auth-email">Email</label>
          <Input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
          <label className="field-label" htmlFor="auth-password">Password</label>
          <Input id="auth-password" name="password" type="password" autoComplete={authMode === "signin" ? "current-password" : "new-password"} minLength={8} placeholder="At least 8 characters" required />
          {authMessage && <p className="inline-message" role="alert">{authMessage}</p>}
          <Button className="w-full" type="submit" disabled={authBusy}>{authBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}{authMode === "signin" ? "Sign in" : "Create account"}<ArrowRight size={16} /></Button>
          <div className="auth-divider"><span />or<span /></div>
          <Button className="w-full" type="button" variant="outline" onClick={signInWithGoogle} disabled={authBusy}><GoogleMark />Continue with Google</Button>
          <p className="auth-switch">{authMode === "signin" ? "New to LegacyPilot?" : "Already have an account?"}<Button type="button" variant="link" className="h-auto px-1" onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setAuthMessage(""); }}>{authMode === "signin" ? "Create an account" : "Sign in"}</Button></p>
        </form>
        <p className="auth-legal">Built for careful, traceable modernization.</p>
      </section>
      <aside className="auth-aside"><div className="aside-caption"><span className="signal-dot" /> WORKSPACE STATUS <span className="aside-caption-muted">01 / PRIVATE</span></div><div className="aside-code"><div className="code-line"><span>01</span><b>IDENTIFICATION DIVISION.</b></div><div className="code-line"><span>02</span><b>PROGRAM-ID.</b><i> YOUR NEXT CHAPTER.</i></div><div className="code-line"><span>03</span><b>DATA DIVISION.</b></div><div className="code-line faded"><span>04</span><b>WORKING-STORAGE SECTION.</b></div><div className="code-line faded"><span>05</span><b>01 MIGRATION-STATUS</b><i> PIC X(12).</i></div><div className="code-line"><span>06</span><b>PROCEDURE DIVISION.</b></div><div className="code-cursor" /></div><div className="aside-footer"><span>COBOL IN. CLARITY OUT.</span><span>LEGACYPILOT / 2026</span></div></aside>
    </main>;
  }

  return <main className="app-shell">
    <header className="topbar"><Brand /><nav className="top-nav" aria-label="Workspace sections"><span className="nav-active"><Layers3 size={15} />Workspace</span><span className="nav-muted"><Activity size={15} />Integrations <i>2</i></span></nav><div className="topbar-right"><span className="connected-indicator"><span />PRIVATE WORKSPACE</span><span className="user-chip" title={user.email ?? "Signed in"}>{(user.email?.[0] ?? "U").toUpperCase()}</span><Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={16} /></Button></div></header>

    <div className="workspace-wrap">
      <section className="page-heading"><div><div className="breadcrumb"><span>WORKSPACE</span><ChevronRight size={13} /><span className="breadcrumb-current">MIGRATIONS</span></div><h1>Migration workspace</h1><p>Understand the code. Plan the move. Keep every change traceable.</p></div><Button onClick={() => setShowComposer((shown) => !shown)}><Plus size={16} />New migration</Button></section>

      <section className="status-strip" aria-label="Workspace overview">
        <Stat icon={<Boxes size={16} />} label="TOTAL JOBS" value={jobs.length.toString().padStart(2, "0")} />
        <Stat icon={<Activity size={16} />} label="IN PROGRESS" value={activeCount.toString().padStart(2, "0")} tone="info" />
        <Stat icon={<CheckCircle2 size={16} />} label="COMPLETED" value={completeCount.toString().padStart(2, "0")} tone="success" />
        <div className="integration-note"><span className="integration-icon"><TriangleAlert size={17} /></span><div><strong>Migration engine not connected</strong><small>Jobs save securely; IBM Bob and Cloud Run are not yet linked.</small></div><ChevronRight className="integration-arrow" size={16} /></div>
      </section>

      {workspaceError && <div className="workspace-alert" role="alert"><AlertCircle size={16} /><span>{workspaceError}</span><Button variant="ghost" size="icon" onClick={() => setWorkspaceError("")} aria-label="Dismiss message"><X size={15} /></Button></div>}

      {showComposer && <section className="composer" aria-labelledby="composer-title"><div className="composer-head"><div><span className="eyebrow">NEW WORK ITEM</span><h2 id="composer-title">Start a migration</h2><p>Create a private workspace for one COBOL program.</p></div><Button variant="ghost" size="icon" onClick={() => setShowComposer(false)} aria-label="Close"><X size={17} /></Button></div><form onSubmit={createJob}><label className="field-label" htmlFor="job-name">Migration name</label><Input id="job-name" value={jobName} onChange={(event) => setJobName(event.target.value)} placeholder="e.g. Customer account inquiry" required maxLength={100} /><div className="source-label"><label className="field-label" htmlFor="cobol-source">COBOL source</label><span>{source.length.toLocaleString()} / 500,000</span></div><Textarea id="cobol-source" value={source} onChange={(event) => setSource(event.target.value)} placeholder={'IDENTIFICATION DIVISION.\nPROGRAM-ID. YOUR-PROGRAM.\n\nPaste the source you want to organize for migration…'} rows={9} className="source-editor" required /><div className="composer-footer"><span><ShieldCheck size={14} />Visible only in your account</span><Button type="submit" disabled={isCreating || !jobName.trim() || !source.trim()}>{isCreating ? <LoaderCircle className="size-4 animate-spin" /> : <Play size={15} />}{isCreating ? "Saving…" : "Create migration"}</Button></div></form></section>}

      <section className="work-area">
        <div className="jobs-column"><div className="section-top"><div><span className="eyebrow">YOUR WORK</span><h2>Migration jobs <span className="count-bubble">{jobs.length}</span></h2></div><Button variant="ghost" size="icon" onClick={() => setShowComposer(true)} aria-label="New migration" title="New migration"><Plus size={18} /></Button></div>
          <div className="filter-bar" role="group" aria-label="Filter migration jobs">{(["all", "active", "completed"] as ViewFilter[]).map((item) => <Button key={item} variant={filter === item ? "secondary" : "ghost"} size="sm" onClick={() => setFilter(item)}>{item === "all" ? "All jobs" : item === "active" ? "In progress" : "Completed"}</Button>)}</div>
          {isLoadingJobs ? <div className="empty-state"><LoaderCircle className="size-5 animate-spin text-primary" /><p>Loading your workspace…</p></div> : visibleJobs.length === 0 ? <div className="empty-state"><span className="empty-mark"><FileCode2 size={22} /></span><h3>{jobs.length === 0 ? "Your migration workspace is ready" : "Nothing in this view"}</h3><p>{jobs.length === 0 ? "Create a job to organize a COBOL program and prepare its migration phases." : "Try another filter or start a new migration."}</p>{jobs.length === 0 && <Button variant="outline" size="sm" onClick={() => setShowComposer(true)}><Plus size={14} />Create first migration</Button>}</div> : <div className="job-list" role="list">{visibleJobs.map((job) => <JobRow key={job.id} job={job} active={job.id === selectedId} onSelect={() => setSelectedId(job.id)} />)}</div>}
          <div className="jobs-foot"><span><LockIcon />YOUR JOBS ARE PRIVATE</span><span>{visibleJobs.length} SHOWN</span></div>
        </div>

        <div className="detail-column">{selectedJob ? <>
          <div className="detail-heading"><div><div className="detail-meta"><span className="eyebrow">MIGRATION DETAIL</span><StatusBadge status={selectedJob.status} /></div><h2>{selectedJob.name}</h2><p><Clock3 size={13} />Created {formatDate(selectedJob.created_at)} <span className="meta-dot">·</span><span className="mono">{selectedJob.id.slice(0, 8).toUpperCase()}</span></p></div><Button variant="outline" size="sm" disabled title="Downloads are available when converted output exists"><ArrowDownToLine size={14} />Export</Button></div>
          <div className="detail-progress"><div><span>OVERALL PROGRESS</span><strong>{selectedJob.progress}%</strong></div><Progress value={selectedJob.progress} aria-label={`Migration progress ${selectedJob.progress}%`} /><span className="progress-caption">{selectedJob.status === "pending" ? "Waiting for the migration engine connection" : statusDescription(selectedJob.status)}</span></div>
          <section className="detail-section"><div className="section-label"><GitBranch size={15} /><h3>Migration phases</h3><span>{selectedPhases.filter((phase) => phase.status === "completed").length}/{selectedPhases.length} complete</span></div>{selectedPhases.length ? <ol className="phase-list">{selectedPhases.map((phase, index) => <PhaseRow key={phase.id} phase={phase} index={index} total={selectedPhases.length} />)}</ol> : <div className="compact-empty"><CircleDashed size={16} />Phase checklist unavailable for this job.</div>}</section>
          <section className="detail-section code-section"><div className="section-label"><Code2 size={15} /><h3>Source &amp; output</h3><span className="source-tag"><span />COBOL / JAVA</span></div><div className="code-compare"><div className="code-pane"><div className="pane-title"><span className="language-indicator cobol" />SOURCE.CBL <span>INPUT</span></div><pre>{selectedJob.cobol_source || "No source saved."}</pre></div><div className="code-pane output-pane"><div className="pane-title"><span className="language-indicator java" />OUTPUT.JAVA <span>NOT GENERATED</span></div>{selectedJob.java_output ? <pre>{selectedJob.java_output}</pre> : <div className="code-placeholder"><TerminalSquare size={20} /><span>Java output will appear here after the migration engine is connected.</span></div>}</div></div></section>
          <section className="detail-section impact-section"><div className="section-label"><Activity size={15} /><h3>Impact analysis</h3><span>{selectedImpacts.length} findings</span></div>{selectedImpacts.length ? <ul className="impact-list">{selectedImpacts.map((impact) => <li key={impact.id}><span className={`impact-level impact-${impact.impact_level}`}>{impact.impact_level}</span><div><strong>{impact.affected_program}</strong><p>{impact.details}</p></div></li>)}</ul> : <div className="impact-empty"><span className="impact-empty-icon"><Activity size={16} /></span><div><strong>Analysis will appear here</strong><p>Impact findings are added when an analysis engine is connected.</p></div></div>}</section>
        </> : <div className="detail-welcome"><span className="welcome-icon"><Layers3 size={22} /></span><span className="eyebrow">WORKSPACE OVERVIEW</span><h2>Your next migration starts here.</h2><p>Choose a job to review its source, progress, and findings. Your source and migration records are saved privately to your account.</p><Button variant="outline" onClick={() => setShowComposer(true)}><Plus size={15} />Start a migration</Button><div className="connect-list"><span><Check size={14} />Private job storage</span><span><CircleDashed size={14} />IBM Bob connection <small>not connected</small></span><span><CircleDashed size={14} />Antigravity API <small>not connected</small></span></div></div>}</div>
      </section>

      <footer className="app-footer"><span><span className="footer-mark"><span /></span>LEGACYPILOT <i>·</i> MODERNIZATION WORKSPACE</span><span><span className="footer-lock"><LockIcon /></span>YOUR SOURCE IS PRIVATE</span><span>INTEGRATION STATUS <b>01 / 03</b></span></footer>
    </div>
  </main>;
}

function Brand() {
  return <div className="brand-mark"><span className="brand-symbol"><span /><span /><span /></span><span className="brand-word">legacy<span>pilot</span></span></div>;
}

function Stat({ icon, label, value, tone = "default" }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return <div className="stat-cell"><span className={`stat-icon stat-${tone}`}>{icon}</span><div><span className="stat-label">{label}</span><strong>{value}</strong></div></div>;
}

function JobRow({ job, active, onSelect }: { job: Job; active: boolean; onSelect: () => void }) {
  return <button type="button" role="listitem" className={`job-row${active ? " job-row-active" : ""}`} onClick={onSelect} aria-pressed={active}><span className="job-glyph"><FileCode2 size={17} /></span><span className="job-main"><strong>{job.name}</strong><span><span className="mono">{job.id.slice(0, 8).toUpperCase()}</span><i>·</i>{formatDate(job.created_at)}</span></span><span className="job-status"><StatusBadge status={job.status} /><span className="job-progress"><span><i style={{ width: `${job.progress}%` }} /></span>{job.progress}%</span></span><ChevronRight className="job-chevron" size={15} /></button>;
}

function StatusBadge({ status }: { status: string }) {
  const active = ["analyzing", "planning", "refactoring", "validating"].includes(status);
  const variant = status === "completed" ? "complete" : status === "failed" ? "failed" : active ? "active" : "pending";
  const label = status === "pending" ? "Queued" : status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge className={`status-badge badge-${variant}`}>{active && <span className="badge-dot" />}{status === "completed" && <Check size={11} />}{status === "failed" && <AlertCircle size={11} />}{label}</Badge>;
}

function PhaseRow({ phase, index, total }: { phase: Phase; index: number; total: number }) {
  const complete = phase.status === "completed";
  const running = phase.status === "running";
  return <li className="phase-item"><span className={`phase-icon${complete ? " phase-done" : running ? " phase-running" : ""}`}>{complete ? <Check size={13} /> : running ? <LoaderCircle size={13} /> : String(index + 1).padStart(2, "0")}</span><div className="phase-copy"><strong>{phase.phase_name}</strong><span>{complete ? "Completed" : running ? "In progress" : "Awaiting engine connection"}</span></div><span className={`phase-state phase-${phase.status}`}>{phase.status === "completed" ? "DONE" : phase.status === "running" ? "RUNNING" : "PENDING"}</span>{index < total - 1 && <span className="phase-connector" />}</li>;
}

function GoogleMark() {
  return <span className="google-mark" aria-hidden="true">G</span>;
}

function LockIcon() {
  return <ShieldCheck size={12} />;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusDescription(status: string) {
  if (status === "failed") return "This job needs attention before it can continue.";
  if (status === "completed") return "All migration phases are complete.";
  return `Current phase: ${status}.`;
}