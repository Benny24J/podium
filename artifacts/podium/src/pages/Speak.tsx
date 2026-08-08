import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Mic, MicOff, ShieldCheck, Square, Video } from 'lucide-react';
import { useLocation } from 'wouter';
import { loadFlow, saveFlow, formatSeconds } from '@/lib/session';
import { PodiumShell, PageError } from '@/components/PodiumShell';

export default function Speak() {
  const [, setLocation] = useLocation();
  const [flow, setFlow] = useState(loadFlow);
  const [permission, setPermission] = useState<'waiting' | 'granted' | 'denied'>('waiting');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showDiscard, setShowDiscard] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  if (!flow.topic) return <PodiumShell><PageError onRetry={() => setLocation('/')} /></PodiumShell>;
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);
  useEffect(() => { if (!recording) return; const id = window.setInterval(() => setElapsed((value) => value + 1), 1000); return () => window.clearInterval(id); }, [recording]);
  useEffect(() => { if (recording && elapsed >= flow.speakingSeconds) stopRecording(); }, [elapsed, flow.speakingSeconds, recording]);
  useEffect(() => () => stream?.getTracks().forEach((track) => track.stop()), [stream]);
  async function requestPermission() {
    try { const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); setStream(media); setPermission('granted'); } catch { setPermission('denied'); }
  }
  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
    recorder.onstop = () => { const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' }); const url = URL.createObjectURL(blob); saveFlow({ ...flow, speakingElapsed: elapsed, recordingUrl: url }); setLocation('/results'); };
    recorder.start(); recorderRef.current = recorder; setRecording(true);
  }
  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
    stream?.getTracks().forEach((track) => track.stop());
  }
  function selectSpeakingTime(seconds: number) {
    const next = { ...flow, speakingSeconds: seconds };
    setFlow(next);
    saveFlow(next);
  }
  return <PodiumShell><div className="mx-auto max-w-6xl px-5 py-8 lg:px-12 lg:py-12"><button onClick={() => recording ? setShowDiscard(true) : setLocation('/research')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="button-back-research"><ArrowLeft size={16} /> {recording ? 'Leave recording' : 'Back to research'}</button><div className="mt-8 grid gap-7 lg:grid-cols-[1.35fr_.65fr]"><section className="relative overflow-hidden rounded-[1.5rem] bg-[#182f35] p-3 sm:p-5"><div className="relative aspect-video overflow-hidden rounded-[1rem] bg-[#102326]">{stream ? <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#d7b568]/30 text-[#d7b568]"><Video size={25} /></div><p className="mt-5 font-serif text-2xl text-[#f7f0df]">Your private stage</p><p className="mt-2 text-sm text-[#f7f0df]/50">Camera preview appears here</p></div></div>}<div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#102326]/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.15em] text-[#f7f0df]">{recording ? <><span className="h-2 w-2 animate-pulse rounded-full bg-[#ed765d]" /> Recording</> : 'Preview'}</div><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[#f7f0df]/60"><span className="flex items-center gap-2 text-xs">{stream ? <Mic size={14} /> : <MicOff size={14} />} camera + microphone</span><span className="font-mono text-xs">{formatSeconds(elapsed)} / {formatSeconds(flow.speakingSeconds)}</span></div></div></section><aside className="flex flex-col justify-center rounded-[1.5rem] border border-border bg-card p-6 sm:p-8"><p className="font-mono text-[10px] uppercase tracking-[.17em] text-accent">Speak / 03</p><h1 className="mt-5 font-serif text-3xl leading-tight">Make your point.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{flow.topic.title}</p>{!recording && <div className="mt-7"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Speaking time</p><div className="mt-3 flex flex-wrap gap-2">{[{ value: 60, label: '1 min' }, { value: 120, label: '2 min' }, { value: 300, label: '5 min' }, { value: 600, label: '10 min' }, { value: 900, label: '15 min' }].map((duration) => <button key={duration.value} onClick={() => selectSpeakingTime(duration.value)} className={`rounded-lg px-3 py-2 font-mono text-xs transition ${flow.speakingSeconds === duration.value ? 'bg-accent text-accent-foreground' : 'border border-border bg-secondary hover:border-accent'}`} data-testid={`button-speaking-${duration.value}`}>{duration.label}</button>)}</div></div>}{permission === 'waiting' && <><div className="mt-8 flex gap-3 rounded-xl bg-secondary p-4"><ShieldCheck size={19} className="shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground">Podium uses your camera only in this room. Nothing starts until you give permission.</p></div><button onClick={requestPermission} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground" data-testid="button-allow-camera"><Video size={16} /> Allow camera & microphone</button></>}{permission === 'denied' && <div className="mt-8 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">Camera or microphone access was declined. Check your browser permissions, then try again.<button onClick={requestPermission} className="mt-4 block rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold" data-testid="button-retry-permission">Try permission again</button></div>}{permission === 'granted' && <><div className="mt-8 flex items-center gap-3 rounded-xl bg-[hsl(151_35%_48%/.1)] p-4 text-sm text-[hsl(151_35%_35%)]"><Check size={17} /> You're all set. Take one breath.</div>{!recording ? <button onClick={startRecording} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground" data-testid="button-start-recording"><Mic size={17} /> Start recording</button> : <button onClick={() => setShowDiscard(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground" data-testid="button-stop-recording"><Square size={15} fill="currentColor" /> Stop and review</button>}</>}{!recording && <button onClick={() => setLocation('/research')} className="mt-3 w-full rounded-full px-4 py-3 text-sm text-muted-foreground hover:bg-secondary" data-testid="button-return-research">Return to research</button>}</aside></div></div>{showDiscard && <div className="fixed inset-0 z-30 grid place-items-center bg-primary/40 p-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl bg-card p-7 shadow-2xl"><h2 className="font-serif text-2xl">Stop this take?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">You can review it first, or discard everything and return to the research room.</p><div className="mt-7 flex gap-2"><button onClick={() => setShowDiscard(false)} className="flex-1 rounded-full border border-border px-4 py-3 text-sm" data-testid="button-keep-recording">Keep going</button><button onClick={stopRecording} className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground" data-testid="button-confirm-stop">Stop take</button></div></div></div>}</PodiumShell>;
}