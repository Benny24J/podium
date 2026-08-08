import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Clock3, Compass, Lightbulb, Shuffle, Sparkles, TimerReset } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { getGetRandomTopicQueryKey, getGetSessionSummaryQueryKey, getListCategoriesQueryKey, getListTopicsQueryKey, useGetRandomTopic, useGetSessionSummary, useListCategories, useListTopics } from '@workspace/api-client-react';
import type { Category, Topic } from '@workspace/api-client-react';
import { PodiumShell, PageError, PageLoading } from '@/components/PodiumShell';
import { getSessionKey, loadFlow, saveFlow } from '@/lib/session';

const durations = [
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1200, label: '20 min' },
  { value: 1800, label: '30 min' },
  { value: 2700, label: '45 min' },
  { value: 3600, label: '60 min' },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(loadFlow().topic);
  const [researchSeconds, setResearchSeconds] = useState(loadFlow().researchSeconds);
  const [speakingSeconds, setSpeakingSeconds] = useState(loadFlow().speakingSeconds);
  const categories = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const topics = useListTopics(categoryId ? { categoryId } : undefined, { query: { queryKey: getListTopicsQueryKey(categoryId ? { categoryId } : undefined), enabled: true } });
  const random = useGetRandomTopic(categoryId ? { categoryId } : undefined, { query: { queryKey: getGetRandomTopicQueryKey(categoryId ? { categoryId } : undefined), enabled: false } });
  const summary = useGetSessionSummary({ sessionKey: getSessionKey() }, { query: { queryKey: getGetSessionSummaryQueryKey({ sessionKey: getSessionKey() }) } });
  const category = useMemo(() => (categories.data ?? []).find((item) => item.id === categoryId), [categories.data, categoryId]);

  if (categories.isLoading || summary.isLoading) return <PodiumShell><PageLoading label="Setting the room" /></PodiumShell>;
  if (categories.isError) return <PodiumShell><PageError onRetry={() => categories.refetch()} /></PodiumShell>;

  function chooseTopic(topic: Topic) { setSelectedTopic(topic); saveFlow({ ...loadFlow(), topic }); }
  function shuffle() { random.refetch().then((result) => { if (result.data) chooseTopic(result.data); }); }
  function begin() {
    if (!selectedTopic) return;
    saveFlow({ topic: selectedTopic, researchSeconds, speakingSeconds, researchElapsed: 0, speakingElapsed: 0, recordingUrl: null, recordingId: null });
    setLocation('/research');
  }

  return <PodiumShell>
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-12 lg:py-12">
      <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-accent">Practice room / 01</p><h1 className="mt-4 max-w-2xl font-serif text-4xl leading-[1.03] tracking-[-.04em] sm:text-6xl">Think clearly.<br /><em className="text-accent">Speak boldly.</em></h1></div><div className="hidden items-center gap-3 md:flex"><span className="h-2 w-2 rounded-full bg-[hsl(151_45%_43%)]" /><span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">room is yours</span></div></div>
      <div className="mt-12 grid gap-5 xl:grid-cols-[1.45fr_.78fr]">
        <section className="relative overflow-hidden rounded-[1.5rem] bg-primary p-6 text-primary-foreground sm:p-9">
          <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full border border-primary-foreground/10" /><div className="absolute -right-4 -top-8 h-36 w-36 rounded-full border border-primary-foreground/10" />
          <div className="relative"><div className="flex items-center justify-between"><span className="rounded-full border border-primary-foreground/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.16em]">Build a session</span><Sparkles size={18} className="text-[hsl(var(--primary)/.45)]" /></div>
            <h2 className="mt-10 max-w-md font-serif text-3xl leading-tight sm:text-4xl">What do you want to explore today?</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <SelectField label="Category" value={category?.name ?? 'Any category'} icon={<Compass size={15} />} onChange={(event) => { const value = event.target.value; setCategoryId(value === 'any' ? undefined : Number(value)); }}><option value="any">Any category</option>{(categories.data ?? []).map((item: Category) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField>
              <button onClick={shuffle} className="flex h-[54px] items-center justify-center gap-2 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 text-sm transition hover:bg-primary-foreground/15" data-testid="button-shuffle-topic"><Shuffle size={16} className={random.isFetching ? 'animate-spin' : ''} />{random.isFetching ? 'Finding a prompt' : 'Shuffle a topic'}</button>
            </div>
            <div className="mt-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/[.07] p-4"><div className="flex items-start justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary-foreground/55">Your prompt</p><p className="mt-2 text-lg leading-snug">{selectedTopic?.title ?? 'Choose a category or shuffle to begin.'}</p>{selectedTopic && <p className="mt-2 text-xs text-primary-foreground/60">{selectedTopic.angles.length} angles to help you get started</p>}</div><Lightbulb className="mt-1 shrink-0 text-[hsl(var(--sidebar-primary))]" size={20} /></div></div>
            <div className="mt-8 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-primary-foreground/55">Research time</p><div className="mt-3 flex gap-1.5">{durations.map((duration) => <button key={duration.value} onClick={() => setResearchSeconds(duration.value)} className={`rounded-lg px-3 py-2 font-mono text-xs transition ${researchSeconds === duration.value ? 'bg-[hsl(var(--sidebar-primary))] text-primary' : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/15'}`} data-testid={`button-research-${duration.value}`}>{duration.label}</button>)}</div></div><button onClick={begin} disabled={!selectedTopic} className="group flex shrink-0 items-center gap-2 rounded-full bg-[hsl(var(--sidebar-primary))] px-5 py-3 text-sm font-semibold text-primary transition disabled:cursor-not-allowed disabled:opacity-35" data-testid="button-start-research">Take the stage <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button></div>
          </div>
        </section>
        <section className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Your practice</p><TimerReset size={18} className="text-accent" /></div><p className="mt-7 font-serif text-5xl">{summary.data?.sessionCount ?? 0}</p><p className="mt-1 text-sm text-muted-foreground">sessions completed</p><div className="my-7 h-px bg-border" /><div className="grid grid-cols-2 gap-4"><div><p className="font-mono text-xl">{formatStat(summary.data?.totalSpeakingSeconds ?? 0)}</p><p className="mt-1 text-xs text-muted-foreground">speaking time</p></div><div><p className="font-mono text-xl">{formatStat(summary.data?.totalResearchSeconds ?? 0)}</p><p className="mt-1 text-xs text-muted-foreground">research time</p></div></div><Link href="/history" className="mt-9 flex items-center justify-between border-t border-border pt-5 text-sm font-semibold hover:text-accent" data-testid="link-view-history">View your history <ArrowRight size={16} /></Link></section>
      </div>
      <section className="mt-12"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">The ritual</p><h2 className="mt-2 font-serif text-3xl tracking-[-.03em]">A little structure, a lot of room.</h2></div><Clock3 size={21} className="hidden text-accent sm:block" /></div><div className="mt-6 grid gap-3 md:grid-cols-3"><Ritual number="01" title="Research the edges" copy="Find the tension, the counterpoint, the detail that makes an idea yours." /><Ritual number="02" title="Step into the light" copy="A private countdown creates just enough pressure to make the thinking useful." /><Ritual number="03" title="Listen back" copy="Notice what landed. Keep the take that sounds most like you." /></div></section>
      <section className="mt-12 rounded-2xl border border-border bg-secondary/45 p-5 sm:p-7"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Topic library</h2><span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">{topics.data?.length ?? 0} prompts</span></div><div className="mt-5 flex flex-wrap gap-2">{(topics.data ?? []).slice(0, 8).map((topic) => <button key={topic.id} onClick={() => chooseTopic(topic)} className={`rounded-full border px-3.5 py-2 text-xs transition ${selectedTopic?.id === topic.id ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:border-accent'}`} data-testid={`button-topic-${topic.id}`}>{topic.title}</button>)}</div></section>
    </div>
  </PodiumShell>;
}
function SelectField({ label, icon, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; icon: React.ReactNode }) { return <label className="relative flex h-[54px] items-center gap-2 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-sm"><span className="text-primary-foreground/60">{icon}</span><span className="sr-only">{label}</span><select {...props} className="w-full appearance-none bg-transparent text-primary-foreground outline-none [&>option]:text-foreground" data-testid={`select-${label.toLowerCase().replaceAll(' ', '-')}`}>{children}</select><ChevronDown size={15} className="pointer-events-none text-primary-foreground/60" /></label>; }
function Ritual({ number, title, copy }: { number: string; title: string; copy: string }) { return <div className="rounded-2xl border border-border bg-card p-5"><p className="font-mono text-[10px] text-accent">{number}</p><h3 className="mt-7 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>; }
function formatStat(value: number) { return value < 60 ? `${value}s` : `${Math.floor(value / 60)}m`; }