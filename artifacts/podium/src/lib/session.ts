import type { Session, Topic } from '@workspace/api-client-react';

export type FlowDraft = {
  topic: Topic | null;
  researchSeconds: number;
  speakingSeconds: number;
  researchElapsed: number;
  speakingElapsed: number;
  recordingUrl: string | null;
  recordingId: string | null;
};

export const SESSION_KEY_STORAGE = 'podium-session-key';
export const FLOW_STORAGE = 'podium-flow';
export const LOCAL_RECORDINGS_STORAGE = 'podium-recordings';
const RECORDING_DB_NAME = 'podium-recordings-db';
const RECORDING_STORE_NAME = 'recordings';

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
      recordingId: value.recordingId ?? null,
    };
  } catch {
    return { topic: null, researchSeconds: 600, speakingSeconds: 60, researchElapsed: 0, speakingElapsed: 0, recordingUrl: null, recordingId: null };
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

function openRecordingDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(RECORDING_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(RECORDING_STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecordingBlob(id: string, blob: Blob) {
  const db = await openRecordingDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(RECORDING_STORE_NAME, 'readwrite').objectStore(RECORDING_STORE_NAME).put(blob, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function getRecordingBlob(id: string | null) {
  if (!id) return null;
  const db = await openRecordingDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const request = db.transaction(RECORDING_STORE_NAME, 'readonly').objectStore(RECORDING_STORE_NAME).get(id);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return blob;
}

export async function deleteRecordingBlob(id: string | null) {
  if (!id) return;
  const db = await openRecordingDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(RECORDING_STORE_NAME, 'readwrite').objectStore(RECORDING_STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = Math.floor(total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}