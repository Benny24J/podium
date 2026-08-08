import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Circle, ExternalLink, Search, Timer } from 'lucide-react';
import { useLocation } from 'wouter';
import { PodiumShell, PageError } from '@/components/PodiumShell';
import { formatSeconds, loadFlow, saveFlow } from '@/lib/session';

export default function Research() {
  const [, setLocation] = useLocation();
  const [flow, setFlow] = useState(loadFlow);
  const [remaining, setRemaining] = useState(Math.max(0, flow.researchSeconds - flow.researchElapsed));
  const [checked, setChecked] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const percent = useMemo(() => flow.researchSeconds ? ((flow.researchSeconds - remaining) / flow.researchSeconds) * 100 : 0, [flow.researchSeconds, remaining]);
  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started]);
  useEffect(() => { if (started && remaining === 0) continueToSpeak(); }, [remaining, started]);
  if (!flow.topic) return <PodiumShell><PageError onRetry={() => setLocation('/')} /></PodiumShell>;
  function continueToSpeak() { const elapsed = flow.researchSeconds - remaining; saveFlow({ ...flow, researchElapsed: elapsed }); setLocation('/speak'); }
  function back() { saveFlow({ ...flow, researchElapsed: flow.researchSeconds - remaining }); setLocation('/'); }
  return <PodiumShell><div className="mx-auto max-w-6xl px-5 py-8 lg:px-12 lg:py-12">
    <button onClick={back} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="button-back-home"><ArrowLeft size={16} /> Back to setup</button>
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
      <div><div className="flex items-center gap-3"><span className="rounded-full bg-accent/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.15em] text-accent">Research / 02</span><span className="text-sm text-muted-foreground">{flow.topic.categoryName}</span></div><h1 className="mt-7 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-.04em] sm:text-6xl">{flow.topic.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Take a beat. Gather enough material to form a point of view, not a pile of facts.</p>
        <div className="mt-10 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${percent}%` }} /></div>
        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground"><span>{started ? 'Research in progress' : 'Ready when you are'}</span><span>{formatSeconds(remaining)} left</span></div>
        <div className="mt-12"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Angles to explore</h2><BookOpen size={19} className="text-accent" /></div><div className="mt-5 grid gap-3">{flow.topic.angles.map((angle, index) => <button key={angle} onClick={() => setChecked((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])} className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${checked.includes(index) ? 'border-[hsl(151_35%_48%)] bg-[hsl(151_35%_48%/.08)]' : 'border-border bg-card hover:border-accent'}`} data-testid={`button-angle-${index}`}><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${checked.includes(index) ? 'border-[hsl(151_35%_48%)] bg-[hsl(151_35%_48%)] text-card' : 'border-border'}`}>{checked.includes(index) ? <Check size={12} /> : <Circle size={9} className="text-muted-foreground" />}</span><span><span className="block text-sm leading-6">{angle}</span><span className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground"><Search size={11} /> Research prompt</span></span></button>)}</div></div>
      </div>
      <aside className="lg:pt-16"><div className={`rounded-[1.5rem] p-6 ${started ? 'bg-primary text-primary-foreground' : 'border border-border bg-card'}`}><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.15em] opacity-60">The clock</span><Timer size={18} className={started ? 'text-[hsl(var(--sidebar-primary))]' : 'text-accent'} /></div><p className="mt-8 font-mono text-5xl tracking-[-.06em]">{formatSeconds(remaining)}</p><p className="mt-2 text-sm opacity-65">{started ? 'Use the time with intention.' : 'A focused window for your thinking.'}</p><button onClick={() => setStarted(true)} disabled={started} className="mt-8 w-full rounded-full bg-[hsl(var(--sidebar-primary))] px-4 py-3 text-sm font-semibold text-primary disabled:opacity-30" data-testid="button-start-timer">{started ? 'Timer running' : 'Start research timer'}</button></div><button onClick={continueToSpeak} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold transition hover:border-accent hover:text-accent" data-testid="button-end-research">End research early <ArrowRight size={15} /></button><p className="mt-8 flex gap-2 text-xs leading-5 text-muted-foreground"><ExternalLink size={14} className="mt-0.5 shrink-0" />Open a source in another tab, then come back when your idea has a shape.</p></aside>
    </div>
  </div></PodiumShell>;
}