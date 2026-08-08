import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, Check, Eye, Lightbulb, Play, RotateCcw, Save, Sparkles, UserRound } from 'lucide-react';
import { useLocation } from 'wouter';
import { getListSessionsQueryKey, useCreateSession, useListSessions } from '@workspace/api-client-react';
import { PodiumShell, PageError } from '@/components/PodiumShell';
import { analyzeRecording, type FeedbackAnalysis, FILLER_PATTERN } from '@/lib/feedback';
import { formatSeconds, getRecordingBlob, getSessionKey, loadFlow, saveLocalRecording } from '@/lib/session';

type AnalysisState = 'idle' | 'loading' | 'ready' | 'error';

export default function Results() {
  const [, setLocation] = useLocation();
  const [flow] = useState(loadFlow);
  const [recordingUrl, setRecordingUrl] = useState(flow.recordingUrl);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisLabel, setAnalysisLabel] = useState('Preparing your review');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const create = useCreateSession();
  const sessions = useListSessions({ sessionKey: getSessionKey() }, { query: { queryKey: getListSessionsQueryKey({ sessionKey: getSessionKey() }) } });

  useEffect(() => {
    let active = true;
    getRecordingBlob(flow.recordingId).then((blob) => {
      if (!active || !blob) return;
      setRecordingBlob(blob);
      const url = URL.createObjectURL(blob);
      setRecordingUrl(url);
    }).catch(() => {
      if (active) setAnalysisError('The local recording could not be reopened.');
    });
    return () => { active = false; };
  }, [flow.recordingId]);

  useEffect(() => {
    if (!recordingBlob || analysisState === 'loading' || analysisState === 'ready') return;
    let active = true;
    setAnalysisState('loading');
    setAnalysisError(null);
    analyzeRecording(recordingBlob, flow.speakingElapsed, setAnalysisLabel).then((result) => {
      if (!active) return;
      setAnalysis(result);
      setAnalysisState('ready');
    }).catch((error) => {
      if (!active) return;
      setAnalysisState('error');
      setAnalysisError(error instanceof Error ? error.message : 'Analysis could not be completed.');
    });
    return () => { active = false; };
  }, [recordingBlob, flow.speakingElapsed, analysisState]);

  useEffect(() => () => {
    if (recordingUrl?.startsWith('blob:')) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  const transcriptParts = useMemo(() => {
    if (!analysis?.transcript) return [];
    return analysis.transcript.split(FILLER_PATTERN);
  }, [analysis?.transcript]);

  if (!flow.topic) return <PodiumShell><PageError onRetry={() => setLocation('/')} /></PodiumShell>;
  const topic = flow.topic;

  function save() {
    if (!analysis) return;
    create.mutate({
      data: {
        sessionKey: getSessionKey(),
        topicId: topic.id,
        researchSeconds: flow.researchElapsed,
        speakingSeconds: flow.speakingElapsed,
        recordingUrl,
        transcript: analysis.transcript,
        fillerCount: analysis.fillerCount,
        fillersPerMinute: analysis.fillersPerMinute,
        eyeContactPercent: analysis.eyeContactPercent,
        postureScore: analysis.postureScore,
        stillnessScore: analysis.stillnessScore,
        visualSamples: analysis.visualSamples,
        feedbackSummary: analysis.summary,
        feedbackStrengths: analysis.strengths,
        feedbackImprovements: analysis.improvements,
        feedbackNextTip: analysis.nextTip,
      },
    }, {
      onSuccess: (session) => {
        saveLocalRecording(session);
        setSaved(true);
        sessions.refetch();
      },
    });
  }

  return <PodiumShell>
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-12 lg:py-12">
      <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="button-results-back"><ArrowLeft size={16} /> Back to practice room</button>
      <div className="mt-10 max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">Take complete / 04</p>
        <h1 className="mt-5 font-serif text-5xl leading-[.98] tracking-[-.05em] sm:text-7xl">That was<br /><em className="text-accent">your voice.</em></h1>
        <p className="mt-5 text-lg text-muted-foreground">Listen back with curiosity. Podium is looking for patterns, not perfection.</p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="overflow-hidden rounded-[1.5rem] bg-[#182f35] p-3 sm:p-5">
          {recordingUrl ? <video src={recordingUrl} controls playsInline className="aspect-video w-full rounded-xl bg-[#102326]" data-testid="video-recording-playback" /> : <div className="grid aspect-video place-items-center rounded-xl bg-[#102326] text-center text-[#f7f0df]/60"><Play size={25} /><p className="mt-2 text-sm">No local recording attached</p></div>}
          <div className="mt-4 flex items-center justify-between px-1 text-[#f7f0df]/60">
            <span className="font-mono text-[10px] uppercase tracking-[.14em]">Private playback</span>
            <span className="font-mono text-xs">{formatSeconds(flow.speakingElapsed)}</span>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[.17em] text-muted-foreground">Session notes</p>
          <h2 className="mt-5 font-serif text-2xl leading-tight">{flow.topic.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{flow.topic.categoryName}</p>
          <div className="my-7 grid grid-cols-2 gap-4 border-y border-border py-5"><MetricValue value={formatSeconds(flow.researchElapsed)} label="research" /><MetricValue value={formatSeconds(flow.speakingElapsed)} label="speaking" /></div>
          {saved ? <div className="flex items-center justify-center gap-2 rounded-full bg-[hsl(151_35%_48%/.12)] px-4 py-3 text-sm font-semibold text-[hsl(151_35%_35%)]" data-testid="status-session-saved"><Check size={17} /> Saved to your history</div> : <button onClick={save} disabled={!analysis || create.isPending} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-45" data-testid="button-save-session">{create.isPending ? 'Saving your take' : <><Save size={16} /> Save this take</>}</button>}
          {!analysis && <p className="mt-3 text-center text-xs text-muted-foreground">Save unlocks when the review is ready.</p>}
          <button onClick={() => setLocation('/research')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:border-accent hover:text-accent" data-testid="button-redo-session"><RotateCcw size={15} /> Redo exercise</button>
        </div>
      </div>

      <section className="mt-8 rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:p-8" data-testid="section-ai-feedback">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-primary))]">After the take</p><h2 className="mt-2 font-serif text-3xl">A useful mirror.</h2></div>
          <span className="flex items-center gap-2 self-start rounded-full border border-primary-foreground/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-primary-foreground/70"><Sparkles size={13} /> On-device analysis</span>
        </div>
        {analysisState === 'loading' && <div className="mt-8 rounded-2xl bg-primary-foreground/[.08] p-5"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[hsl(var(--sidebar-primary))]" /><span className="text-sm">{analysisLabel}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-primary-foreground/10"><div className="h-full w-1/2 animate-pulse rounded-full bg-[hsl(var(--sidebar-primary))]" /></div><p className="mt-3 text-xs text-primary-foreground/55">The first run downloads compact speech and vision models to your browser. It runs after recording, never live.</p></div>}
        {analysisState === 'error' && <div className="mt-8 rounded-2xl border border-[#ed765d]/40 bg-[#ed765d]/10 p-5"><p className="text-sm">{analysisError ?? 'Analysis could not be completed.'}</p><button onClick={() => { setAnalysisState('idle'); setAnalysisError(null); }} className="mt-4 rounded-full bg-[hsl(var(--sidebar-primary))] px-4 py-2 text-xs font-semibold text-primary" data-testid="button-retry-analysis">Try analysis again</button></div>}
        {analysis && <div className="mt-8">
          <p className="max-w-3xl text-base leading-7 text-primary-foreground/80">{analysis.summary}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FeedbackMetric icon={<Activity size={17} />} value={`${analysis.fillerCount}`} label={`${analysis.fillersPerMinute}/min filler words`} />
            <FeedbackMetric icon={<Eye size={17} />} value={formatPercent(analysis.eyeContactPercent)} label="camera-facing moments" />
            <FeedbackMetric icon={<UserRound size={17} />} value={formatScore(analysis.postureScore)} label="open posture" />
            <FeedbackMetric icon={<Activity size={17} />} value={formatScore(analysis.stillnessScore)} label="grounded stillness" />
          </div>
        </div>}
      </section>

      {analysis && <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-accent">Transcript</p><h2 className="mt-2 font-serif text-2xl">Hear the pattern.</h2></div><span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs text-accent">{analysis.fillerCount} highlighted</span></div>
          {analysis.transcript ? <p className="mt-7 text-base leading-8 text-foreground/80">{transcriptParts.map((part, index) => index % 2 === 1 ? <mark key={`${part}-${index}`} className="rounded bg-[hsl(var(--sidebar-primary)/.75)] px-1 text-foreground">{part}</mark> : <span key={`${part}-${index}`}>{part}</span>)}</p> : <p className="mt-7 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">No spoken words were detected. If you spoke, try the analysis again with a stronger microphone signal.</p>}
        </section>
        <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[.17em] text-accent">Coach's notes</p>
          <h2 className="mt-2 font-serif text-2xl">Keep these close.</h2>
          <div className="mt-7"><NoteList title="What worked" items={analysis.strengths} tone="good" /><NoteList title="Try next" items={analysis.improvements} tone="warm" /><div className="mt-6 rounded-2xl bg-secondary p-4"><div className="flex gap-3"><Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" /><div><p className="font-semibold">One small experiment</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{analysis.nextTip}</p></div></div></div></div>
        </section>
      </div>}

      <div className="mt-8 flex items-center gap-3 rounded-2xl bg-secondary/55 p-5 text-sm text-muted-foreground"><Sparkles size={19} className="shrink-0 text-accent" /><span>Your analysis stays with this private browser session so you can notice improvement over time.</span></div>
    </div>
  </PodiumShell>;
}

function MetricValue({ value, label }: { value: string; label: string }) { return <div><p className="font-mono text-xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>; }
function FeedbackMetric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="rounded-xl bg-primary-foreground/[.09] p-4"><div className="flex items-center gap-2 text-[hsl(var(--sidebar-primary))]">{icon}<span className="font-mono text-xl text-primary-foreground">{value}</span></div><p className="mt-2 text-xs text-primary-foreground/60">{label}</p></div>; }
function formatPercent(value: number | null) { return value === null ? '—' : `${value}%`; }
function formatScore(value: number | null) { return value === null ? '—' : `${value}`; }
function NoteList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'warm' }) { return <div className="mb-6"><p className={`font-mono text-[10px] uppercase tracking-[.15em] ${tone === 'good' ? 'text-[hsl(151_35%_35%)]' : 'text-accent'}`}>{title}</p><ul className="mt-3 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'good' ? 'bg-[hsl(151_35%_48%)]' : 'bg-accent'}`} />{item}</li>)}</ul></div>; }