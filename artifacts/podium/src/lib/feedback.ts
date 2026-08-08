import { FaceLandmarker, FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

export type FeedbackAnalysis = {
  transcript: string;
  fillerCount: number;
  fillersPerMinute: number;
  fillerWords: string[];
  eyeContactPercent: number | null;
  postureScore: number | null;
  stillnessScore: number | null;
  visualSamples: number;
  strengths: string[];
  improvements: string[];
  nextTip: string;
  summary: string;
};

export const FILLER_PATTERN = /\b(um|uh|like|you know|so|basically|actually)\b/gi;

export function getFillerWords(transcript: string) {
  return [...transcript.matchAll(FILLER_PATTERN)].map((match) => match[0].toLowerCase());
}

export function buildFeedback(transcript: string, durationSeconds: number, visual: Pick<FeedbackAnalysis, 'eyeContactPercent' | 'postureScore' | 'stillnessScore' | 'visualSamples'>): FeedbackAnalysis {
  const fillerWords = getFillerWords(transcript);
  const minutes = Math.max(durationSeconds / 60, 1 / 60);
  const fillersPerMinute = Number((fillerWords.length / minutes).toFixed(1));
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (transcript.trim().length > 80) strengths.push('You developed a real point of view instead of giving a one-line answer.');
  else strengths.push('You showed up and gave the idea a clear first shape.');
  if (visual.postureScore !== null && visual.postureScore >= 70) strengths.push('Your posture read as open and ready, which helps your message land.');
  else if (visual.eyeContactPercent !== null && visual.eyeContactPercent >= 65) strengths.push(`You returned to the camera often (${visual.eyeContactPercent}% of sampled moments).`);
  else strengths.push('You completed the full take — consistency is the foundation of confident speaking.');

  if (fillerWords.length > 0) {
    const common = [...new Set(fillerWords)].slice(0, 2).map((word) => `"${word}"`).join(' and ');
    improvements.push(`You used ${common} ${fillerWords.length === 1 ? 'once' : `${fillerWords.length} times`} (${fillersPerMinute}/min). Try replacing the next one with a silent breath.`);
  } else {
    improvements.push('No target filler words showed up in the transcript. Keep using quiet pauses when you need a moment.');
  }
  if (visual.eyeContactPercent !== null && visual.eyeContactPercent < 60) improvements.push(`Your gaze was camera-facing in about ${visual.eyeContactPercent}% of sampled moments. Pick one friendly spot near the lens and return to it at the end of each thought.`);
  else if (visual.postureScore !== null && visual.postureScore < 60) improvements.push('Your posture looked a little closed or collapsed in parts of the take. Set both feet down and let your chest stay gently lifted.');
  else if (visual.stillnessScore !== null && visual.stillnessScore < 55) improvements.push('There was visible movement between sampled moments. Try grounding your feet and letting gestures finish before the next sentence.');

  const nextTip = fillerWords.length > 0
    ? 'Next time, mark every filler with a one-second pause. The pause will feel longer to you than it sounds to a listener.'
    : 'Next time, keep one sentence of eye contact with the lens, then let your gaze move naturally as you think.';
  const summary = `You completed a ${Math.max(1, Math.round(durationSeconds / 60))}-minute practice take with ${fillersPerMinute} filler words per minute. ${strengths[0]} ${improvements[0]}`;

  return {
    transcript,
    fillerCount: fillerWords.length,
    fillersPerMinute,
    fillerWords,
    eyeContactPercent: visual.eyeContactPercent,
    postureScore: visual.postureScore,
    stillnessScore: visual.stillnessScore,
    visualSamples: visual.visualSamples,
    strengths,
    improvements,
    nextTip,
    summary,
  };
}

async function extractAudio(blob: Blob) {
  const context = new AudioContext();
  const buffer = await context.decodeAudioData(await blob.arrayBuffer());
  const targetRate = 16_000;
  const samples = new Float32Array(Math.ceil(buffer.duration * targetRate));
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const source = buffer.getChannelData(channel);
    for (let index = 0; index < samples.length; index += 1) {
      const sourceIndex = Math.min(source.length - 1, Math.floor(index * buffer.sampleRate / targetRate));
      samples[index] += source[sourceIndex] / buffer.numberOfChannels;
    }
  }
  await context.close();
  return { samples, duration: buffer.duration };
}

async function transcribe(blob: Blob, onProgress?: (label: string) => void) {
  onProgress?.('Preparing the spoken audio');
  const { pipeline } = await import('@huggingface/transformers');
  const { samples } = await extractAudio(blob);
  onProgress?.('Listening for the transcript');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
    dtype: 'q8',
    device: 'wasm',
  });
  const result = await (transcriber as any)(samples, { chunk_length_s: 30, stride_length_s: 5 });
  if (typeof result === 'string') return result;
  if (Array.isArray(result)) return result.map((item) => item.text ?? '').join(' ').trim();
  return result.text ?? '';
}

type VisualMetrics = Pick<FeedbackAnalysis, 'eyeContactPercent' | 'postureScore' | 'stillnessScore' | 'visualSamples'>;

async function analyzeVideo(blob: Blob, maxSeconds: number, onProgress?: (label: string) => void): Promise<VisualMetrics> {
  onProgress?.('Reading eye contact, posture, and movement');
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.src = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('The recording video could not be analyzed.'));
  });
  const duration = Math.min(video.duration || maxSeconds, maxSeconds || video.duration);
  const wasm = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm');
  const [face, pose] = await Promise.all([
    FaceLandmarker.createFromOptions(wasm, {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
    }),
    PoseLandmarker.createFromOptions(wasm, {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task', delegate: 'GPU' },
      runningMode: 'VIDEO',
      numPoses: 1,
    }),
  ]);
  const samples = Math.max(6, Math.min(18, Math.ceil(duration / 3)));
  let eyeContact = 0;
  let postureTotal = 0;
  let stillnessTotal = 0;
  let previousShoulders: { x: number; y: number } | null = null;
  let visualSamples = 0;
  for (let index = 0; index < samples; index += 1) {
    const time = duration * (index + 0.5) / samples;
    video.currentTime = time;
    await new Promise<void>((resolve) => { video.onseeked = () => resolve(); });
    const timestamp = Math.round(time * 1000);
    const faceResult = face.detectForVideo(video, timestamp);
    const poseResult = pose.detectForVideo(video, timestamp);
    const landmarks = faceResult.faceLandmarks[0];
    const body = poseResult.landmarks[0];
    if (!landmarks && !body) continue;
    visualSamples += 1;
    if (landmarks) {
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const nose = landmarks[1];
      if (leftEye && rightEye && nose) {
        const eyeWidth = Math.max(Math.abs(rightEye.x - leftEye.x), 0.01);
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const eyeCenterY = (leftEye.y + rightEye.y) / 2;
        if (Math.abs(nose.x - eyeCenterX) / eyeWidth < 0.25 && Math.abs(nose.y - eyeCenterY) / eyeWidth < 0.9) eyeContact += 1;
      }
    }
    if (body) {
      const leftShoulder = body[11];
      const rightShoulder = body[12];
      const leftHip = body[23];
      const rightHip = body[24];
      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulders = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
        const hips = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
        const torsoHeight = Math.max(Math.abs(hips.y - shoulders.y), 0.05);
        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
        const head = body[0];
        const lean = head ? Math.abs(head.x - hips.x) / torsoHeight : 0.2;
        postureTotal += Math.max(0, Math.min(100, 100 - lean * 130 + Math.min(shoulderWidth / torsoHeight, 0.9) * 20));
        if (previousShoulders) {
          const movement = Math.hypot(shoulders.x - previousShoulders.x, shoulders.y - previousShoulders.y);
          stillnessTotal += Math.max(0, 100 - movement * 420);
        } else {
          stillnessTotal += 80;
        }
        previousShoulders = shoulders;
      }
    }
  }
  face.close();
  pose.close();
  URL.revokeObjectURL(video.src);
  if (!visualSamples) return { eyeContactPercent: null, postureScore: null, stillnessScore: null, visualSamples: 0 };
  return {
    eyeContactPercent: Math.round((eyeContact / visualSamples) * 100),
    postureScore: postureTotal ? Math.round(postureTotal / visualSamples) : null,
    stillnessScore: stillnessTotal ? Math.round(stillnessTotal / visualSamples) : null,
    visualSamples,
  };
}

export async function analyzeRecording(blob: Blob, durationSeconds: number, onProgress?: (label: string) => void) {
  const transcript = await transcribe(blob, onProgress);
  const visual = await analyzeVideo(blob, durationSeconds, onProgress);
  return buildFeedback(transcript, durationSeconds, visual);
}