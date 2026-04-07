// Bucket Keeper - Voice Recording Service
// Wraps @react-native-voice/voice for speech-to-text

import Voice, {
  type SpeechResultsEvent,
  type SpeechErrorEvent,
} from '@react-native-voice/voice';
import { aiApi } from '../utils/api';
import type { ExtractedTask } from '../types';

type TranscriptCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

let onTranscriptCallback: TranscriptCallback | null = null;
let onErrorCallback: ErrorCallback | null = null;
let isListening = false;
let currentTranscript = '';

function handleSpeechResults(event: SpeechResultsEvent) {
  const text = event.value?.[0] ?? '';
  currentTranscript = text;
  onTranscriptCallback?.(text, true);
}

function handleSpeechPartialResults(event: SpeechResultsEvent) {
  const text = event.value?.[0] ?? '';
  currentTranscript = text;
  onTranscriptCallback?.(text, false);
}

function handleSpeechError(event: SpeechErrorEvent) {
  const message = event.error?.message ?? 'Speech recognition error';
  onErrorCallback?.(message);
  isListening = false;
}

function handleSpeechEnd() {
  isListening = false;
}

export function initVoice() {
  Voice.onSpeechResults = handleSpeechResults;
  Voice.onSpeechPartialResults = handleSpeechPartialResults;
  Voice.onSpeechError = handleSpeechError;
  Voice.onSpeechEnd = handleSpeechEnd;
}

export function destroyVoice() {
  Voice.destroy().then(Voice.removeAllListeners);
  onTranscriptCallback = null;
  onErrorCallback = null;
}

export function setOnTranscript(callback: TranscriptCallback) {
  onTranscriptCallback = callback;
}

export function setOnError(callback: ErrorCallback) {
  onErrorCallback = callback;
}

export async function startListening(locale: string = 'en-US'): Promise<void> {
  if (isListening) return;

  currentTranscript = '';
  isListening = true;

  try {
    await Voice.start(locale);
  } catch (error: any) {
    isListening = false;
    throw new Error(error.message ?? 'Failed to start voice recognition');
  }
}

export async function stopListening(): Promise<string> {
  if (!isListening) return currentTranscript;

  try {
    await Voice.stop();
  } catch (error) {
    // Voice may already be stopped
  }

  isListening = false;
  return currentTranscript;
}

export async function cancelListening(): Promise<void> {
  try {
    await Voice.cancel();
  } catch (error) {
    // Ignore cancel errors
  }
  isListening = false;
  currentTranscript = '';
}

export function getIsListening(): boolean {
  return isListening;
}

export function getCurrentTranscript(): string {
  return currentTranscript;
}

// ── AI Task Extraction ─────────────────────────────────────────

export async function extractTasksFromTranscript(
  transcript: string,
): Promise<ExtractedTask[]> {
  if (!transcript.trim()) return [];

  try {
    const response = await aiApi.extractTasks(transcript);
    return response.data.tasks.map((t) => ({
      title: t.title,
      assignedTo: t.assignedTo,
      isJoint: t.isJoint,
      priority: t.priority,
      category: t.category as any,
      dateText: t.dateText,
      timeText: t.timeText,
      isRecurring: t.isRecurring,
      recurringPattern: t.recurringPattern,
    }));
  } catch (error) {
    console.error('Failed to extract tasks from transcript:', error);
    // Fallback: create a single task from the transcript
    return [{
      title: transcript.trim(),
      assignedTo: null,
      isJoint: false,
      priority: 'medium',
      category: 'personal',
      dateText: null,
      timeText: null,
      isRecurring: false,
      recurringPattern: null,
    }];
  }
}

// ── Date Parsing (using chrono-node) ───────────────────────────

export function parseDateFromText(text: string): Date | null {
  try {
    const chrono = require('chrono-node');
    const results = chrono.parse(text);
    if (results.length > 0 && results[0].date) {
      return results[0].date();
    }
    return null;
  } catch {
    return null;
  }
}
