// ComposeBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottom-sticky compose surface inside ThreadView. Layout from start to end:
//   [Paperclip attach] [Camera] [text input (auto-grow)] [Mic | Send]
// All icons are lucide components.
//
// Mic interactions:
//   • pointer-down OR touch-start → voiceRecorder.start() + show overlay
//   • pointer-up OR touch-end     → voiceRecorder.stop() → send voice
//   • pointer-move up by >80px    → voiceRecorder.cancel() → no message
//
// Send button (replaces mic when text is non-empty):
//   • tap → onSendText(body) + clear input + scroll-to-bottom is parent's job
//
// iOS Safari-friendly: inputmode="text" + autocomplete="off". The textarea
// auto-grows up to 4 rows. We avoid `useLayoutEffect` to keep SSR safe.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Paperclip, Camera, Mic, Send, MicOff } from 'lucide-react';
import { useI18n } from '../../../../contexts/I18nContext';
import { getMessagesString } from '../data/parentAppMessagesI18n';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { VoiceRecorderOverlay } from './VoiceRecorderOverlay';

const CANCEL_THRESHOLD_PX = 80;
const MAX_ROWS = 4;
const LINE_HEIGHT_PX = 22; // matches text-sm leading-snug

interface Props {
  onSendText: (body: string) => void;
  onSendVoice: (blobUrl: string, durationSec: number) => void;
}

export const ComposeBar: React.FC<Props> = ({ onSendText, onSendVoice }) => {
  const { locale } = useI18n();
  const t = (k: string) => getMessagesString(locale, k);
  const recorder = useVoiceRecorder();

  const [body, setBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Track gesture start Y so we can compute upward distance for "cancel".
  const gestureStartYRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const hasText = body.trim().length > 0;
  const showOverlay = recorder.isRecording;

  // Auto-grow textarea up to MAX_ROWS lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxH = LINE_HEIGHT_PX * MAX_ROWS + 16;
    el.style.height = `${Math.min(maxH, el.scrollHeight)}px`;
  }, [body]);

  const handleSendText = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setBody('');
  }, [body, onSendText]);

  // ── Voice gesture handlers ──────────────────────────────────────────────

  const startVoice = useCallback(
    (clientY: number) => {
      if (!recorder.supported) return;
      gestureStartYRef.current = clientY;
      cancelledRef.current = false;
      void recorder.start();
    },
    [recorder]
  );

  const moveVoice = useCallback(
    (clientY: number) => {
      if (!recorder.isRecording) return;
      const startY = gestureStartYRef.current;
      if (startY == null) return;
      const dy = startY - clientY;
      if (dy > CANCEL_THRESHOLD_PX && !cancelledRef.current) {
        cancelledRef.current = true;
        recorder.cancel();
      }
    },
    [recorder]
  );

  const endVoice = useCallback(async () => {
    if (!recorder.isRecording && !cancelledRef.current) {
      // Nothing started.
      gestureStartYRef.current = null;
      return;
    }
    if (cancelledRef.current) {
      cancelledRef.current = false;
      gestureStartYRef.current = null;
      return;
    }
    const result = await recorder.stop();
    gestureStartYRef.current = null;
    if (result && result.durationSec >= 1) {
      onSendVoice(result.blobUrl, result.durationSec);
    }
  }, [recorder, onSendVoice]);

  // Pointer + touch handlers wired together so it works on both web + mobile.
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    startVoice(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    moveVoice(e.clientY);
  };
  const onPointerUp = (_e: React.PointerEvent) => {
    void endVoice();
  };
  const onPointerCancel = () => {
    cancelledRef.current = true;
    recorder.cancel();
    gestureStartYRef.current = null;
  };

  // Keyboard send: Enter (without Shift) sends.
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-3 pt-2 pb-3">
      {showOverlay ? (
        <VoiceRecorderOverlay
          durationSec={recorder.duration}
          warning={recorder.error === 'max-length-reached'}
        />
      ) : (
        <div className="flex items-end gap-1.5">
          <button
            type="button"
            aria-label={t('parentApp.messages.compose.attachAria')}
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('[compose] attach (placeholder)');
            }}
            className="shrink-0 w-9 h-9 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center active:scale-95 transition-transform"
          >
            <Paperclip className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label={t('parentApp.messages.compose.cameraAria')}
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log('[compose] camera (placeholder)');
            }}
            className="shrink-0 w-9 h-9 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center active:scale-95 transition-transform"
          >
            <Camera className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('parentApp.messages.compose.placeholder')}
              autoComplete="off"
              inputMode="text"
              rows={1}
              className="block w-full resize-none rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal leading-snug focus:outline-none focus:border-duo-blue focus:bg-white transition-colors"
            />
          </div>

          {hasText ? (
            <button
              type="button"
              onClick={handleSendText}
              aria-label={t('parentApp.messages.compose.sendAria')}
              className="shrink-0 w-9 h-9 rounded-full bg-duo-blue text-white inline-flex items-center justify-center hover:bg-duo-blue-dark active:bg-duo-blue-dark motion-safe:active:scale-[0.97] transition-colors"
            >
              <Send
                className={`w-4 h-4 ${locale === 'ar' ? '-scale-x-100' : ''}`}
                strokeWidth={2.5}
              />
            </button>
          ) : (
            <button
              type="button"
              aria-label={
                recorder.supported
                  ? t('parentApp.messages.compose.micAria')
                  : t('parentApp.messages.compose.voiceUnsupported')
              }
              title={
                recorder.supported
                  ? t('parentApp.messages.compose.tapToHold')
                  : t('parentApp.messages.compose.voiceUnsupported')
              }
              disabled={!recorder.supported}
              onPointerDown={recorder.supported ? onPointerDown : undefined}
              onPointerMove={recorder.supported ? onPointerMove : undefined}
              onPointerUp={recorder.supported ? onPointerUp : undefined}
              onPointerCancel={recorder.supported ? onPointerCancel : undefined}
              className={`shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors select-none ${
                recorder.supported
                  ? 'bg-duo-blue text-white hover:bg-duo-blue-dark active:bg-duo-blue-dark motion-safe:active:scale-[0.97]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              style={{ touchAction: 'none' }}
            >
              {recorder.supported ? (
                <Mic className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <MicOff className="w-4 h-4" strokeWidth={2.5} />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ComposeBar;
