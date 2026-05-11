// useVoiceRecorder.ts
// ─────────────────────────────────────────────────────────────────────────────
// Browser-native MediaRecorder wrapper. Returns a stateful interface for the
// compose bar:
//
//   { isRecording, duration, start, stop, cancel, blobUrl, error, supported }
//
// On `start()`: getUserMedia → MediaRecorder('audio/webm' fallback 'audio/mp4')
//   → start. We tick `duration` every 100ms via setInterval. At 60s the
//   recorder auto-stops with a `maxLengthReached` error.
//
// On `stop()`: returns { blobUrl, durationSec } (or null if no chunks).
//   The blob URL comes from URL.createObjectURL(blob). Caller is responsible
//   for invoking URL.revokeObjectURL when the corresponding message is removed.
//
// On `cancel()`: stops the recorder and discards any captured chunks. No URL
//   is created. Also stops the underlying mic tracks.
//
// iOS Safari < 14.3 quirk: typeof MediaRecorder === 'undefined' → set
//   supported=false so the UI can swap the mic button for a disabled state.

import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_DURATION_SEC = 60;

/** Best-effort mime-type detection. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
  ];
  for (const m of candidates) {
    try {
      if ((MediaRecorder as any).isTypeSupported?.(m)) return m;
    } catch {
      // ignore
    }
  }
  return undefined;
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  /** Live duration in seconds (integer). */
  duration: number;
  start: () => Promise<void>;
  /** Resolves with the produced blob URL + duration; or null if no audio. */
  stop: () => Promise<{ blobUrl: string; durationSec: number } | null>;
  /** Discards the recording. */
  cancel: () => void;
  /** Latest blob URL from a successful stop (cleared on next start). */
  blobUrl: string | null;
  error: string | null;
  supported: boolean;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const supported =
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia;

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  /** When true, the next `stop` should discard instead of producing a URL. */
  const cancelFlagRef = useRef<boolean>(false);
  /** Resolves the pending stop() Promise. */
  const stopResolverRef = useRef<
    ((v: { blobUrl: string; durationSec: number } | null) => void) | null
  >(null);

  // Track every blob URL we create so callers (and unmount) can revoke them.
  const createdUrlsRef = useRef<Set<string>>(new Set());

  const cleanupStreamAndTimers = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      setError('voice-unsupported');
      return;
    }
    if (isRecording) return;
    setError(null);
    setDuration(0);
    chunksRef.current = [];
    cancelFlagRef.current = false;
    setBlobUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const startedAt = startedAtRef.current;
        const elapsedSec = Math.max(
          1,
          Math.round((Date.now() - startedAt) / 1000)
        );
        cleanupStreamAndTimers();
        setIsRecording(false);

        if (cancelFlagRef.current || chunksRef.current.length === 0) {
          chunksRef.current = [];
          stopResolverRef.current?.(null);
          stopResolverRef.current = null;
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: mime ?? 'audio/webm',
        });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        createdUrlsRef.current.add(url);
        setBlobUrl(url);
        stopResolverRef.current?.({ blobUrl: url, durationSec: elapsedSec });
        stopResolverRef.current = null;
      };

      startedAtRef.current = Date.now();
      recorder.start();
      setIsRecording(true);

      // Tick duration ~10Hz; auto-stop at MAX_DURATION_SEC.
      tickRef.current = window.setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - startedAtRef.current) / 1000
        );
        setDuration(elapsed);
        if (elapsed >= MAX_DURATION_SEC) {
          // Trigger a stop. Don't cancel — caller likely wants to keep it.
          setError('max-length-reached');
          try {
            recorder.stop();
          } catch {
            // ignore — already stopped
          }
        }
      }, 100);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'mic-permission-denied';
      setError(message);
      cleanupStreamAndTimers();
      setIsRecording(false);
    }
  }, [cleanupStreamAndTimers, isRecording, supported]);

  const stop = useCallback((): Promise<{
    blobUrl: string;
    durationSec: number;
  } | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || !isRecording) {
        resolve(null);
        return;
      }
      stopResolverRef.current = resolve;
      cancelFlagRef.current = false;
      try {
        recorderRef.current.stop();
      } catch {
        // If stop throws for some reason, resolve null.
        resolve(null);
        stopResolverRef.current = null;
      }
    });
  }, [isRecording]);

  const cancel = useCallback(() => {
    if (!recorderRef.current || !isRecording) {
      cleanupStreamAndTimers();
      setIsRecording(false);
      return;
    }
    cancelFlagRef.current = true;
    try {
      recorderRef.current.stop();
    } catch {
      cleanupStreamAndTimers();
      setIsRecording(false);
    }
  }, [cleanupStreamAndTimers, isRecording]);

  // Revoke all created object URLs on unmount.
  useEffect(() => {
    return () => {
      cleanupStreamAndTimers();
      createdUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
      createdUrlsRef.current.clear();
    };
  }, [cleanupStreamAndTimers]);

  return {
    isRecording,
    duration,
    start,
    stop,
    cancel,
    blobUrl,
    error,
    supported,
  };
}
