import type { Session, Topic } from '@workspace/api-client-react';

export type FlowDraft = {
  topic: Topic | null;
  researchSeconds: number;
  speakingSeconds: number;
  researchElapsed: number;
  speakingElapsed: number;
  recordingUrl: string | null;
};

export const SESSION_KEY_STORAGE = 'podium-session-key';
export const FLOW_STORAGE = 'podium-flow';
export const LOCAL_RECORDINGS_STORAGE = 'podium-recordings';

export function getSessionKey() {
  const existing = window.localStorage.getItem(SESSION_KEY_STORAGE);
  if (existing) return existing;
  const key = `podium-${crypto.randomUUID()}`;
  window.localStorage.setItem(SESSION_KEY_STORAGE, key);
  return key;
}

export function loadFlow(): FlowDraft {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(FLOW_STORAGE) ?? '');
    return {
      topic: value.topic ?? null,
      researchSeconds: Number(value.researchSeconds) || 600,
      speakingSeconds: Number(value.speakingSeconds) || 60,
      researchElapsed: Number(value.researchElapsed) || 0,
      speakingElapsed: Number(value.speakingElapsed) || 0,
      recordingUrl: value.recordingUrl ?? null,
    };
  } catch {
    return { topic: null, researchSeconds: 600, speakingSeconds: 60, researchElapsed: 0, speakingElapsed: 0, recordingUrl: null };
  }
}

export function saveFlow(flow: FlowDraft) {
  window.sessionStorage.setItem(FLOW_STORAGE, JSON.stringify(flow));
}

export function saveLocalRecording(session: Session) {
  const existing = JSON.parse(window.localStorage.getItem(LOCAL_RECORDINGS_STORAGE) ?? '[]') as Session[];
  window.localStorage.setItem(LOCAL_RECORDINGS_STORAGE, JSON.stringify([session, ...existing.filter((item) => item.id !== session.id)].slice(0, 20)));
}

export function getLocalRecordings() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_RECORDINGS_STORAGE) ?? '[]') as Session[];
  } catch {
    return [] as Session[];
  }
}

export function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}