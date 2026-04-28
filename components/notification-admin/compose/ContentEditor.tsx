import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Link2, Image, ChevronDown, ChevronUp, MousePointerClick,
  Sparkles, Loader2, X, Upload, Trash2,
} from 'lucide-react';

interface CtaButton {
  label: string;
  url: string;
}

type FocusableField =
  | 'title'
  | 'shortMessage'
  | 'body'
  | 'imageUrl'
  | 'ctaButton'
  | null;

interface ContentEditorProps {
  title: string;
  shortMessage: string;
  body: string;
  imageUrl: string;
  ctaButton: CtaButton | null;
  onChange: (field: string, value: any) => void;
  /**
   * Reports the currently-focused content field up to the parent so the
   * live preview can pulse the matching element + render a caret-mirror.
   * Null when no field is focused.
   */
  onFocusField?: (field: FocusableField) => void;
}

interface AiResult {
  title: string;
  shortMessage: string;
  body: string;
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCuwJocZ-0ePR3N6uykjo6c01_5CbHoJuo';

// Shared input/textarea base — unified violet focus ring across the page.
const INPUT_CLASSES =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-duo-purple/30 focus:border-duo-purple transition';

export const ContentEditor: React.FC<ContentEditorProps> = ({
  title,
  shortMessage,
  body,
  imageUrl,
  ctaButton,
  onChange,
  onFocusField,
}) => {
  // Helper: build {onFocus, onBlur} pair that reports field focus to the
  // parent, but only when the consumer wired the callback. Keeps the
  // rest of the form intact when the prop is omitted (no-op).
  const focusHandlers = (field: Exclude<FocusableField, null>) =>
    onFocusField
      ? {
          onFocus: () => onFocusField(field),
          onBlur: () => onFocusField(null),
        }
      : {};
  const [ctaExpanded, setCtaExpanded] = useState(!!ctaButton);
  const [imageError, setImageError] = useState(false);

  // AI Writer state
  const [aiPopupOpen, setAiPopupOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Image upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCtaToggle = () => {
    if (ctaExpanded) {
      onChange('ctaButton', null);
      setCtaExpanded(false);
    } else {
      onChange('ctaButton', { label: '', url: '' });
      setCtaExpanded(true);
    }
  };

  const handleCtaChange = (field: 'label' | 'url', value: string) => {
    const current = ctaButton || { label: '', url: '' };
    onChange('ctaButton', { ...current, [field]: value });
  };

  /* ===== AI Writer ===== */

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a school notification writer for Al-Khadr Modern Schools (مدارس الخضر الحديثة). Write a notification in Arabic for the following request. Return ONLY a JSON object with these fields: {"title": "...", "shortMessage": "...", "body": "..."}. Title max 100 chars. Short message max 200 chars. Body can be longer. Write formally but warmly.\n\nRequest: ${aiPrompt}`,
            }],
          }],
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Strip markdown code fences if present
      const jsonStr = text
        .replace(/```json?\s*\n?/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed: AiResult = JSON.parse(jsonStr);
      setAiResult(parsed);
    } catch {
      setAiError('حدث خطأ أثناء التوليد. حاول مرة أخرى.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAI = () => {
    if (aiResult) {
      onChange('title', aiResult.title);
      onChange('shortMessage', aiResult.shortMessage);
      onChange('body', aiResult.body);
      setAiPopupOpen(false);
      setAiResult(null);
      setAiPrompt('');
      setAiError(null);
    }
  };

  const handleCloseAI = () => {
    setAiPopupOpen(false);
    setAiResult(null);
    setAiPrompt('');
    setAiError(null);
    setAiLoading(false);
  };

  /* ===== Image Upload ===== */

  const handleFile = useCallback((file: File) => {
    setUploadError(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الملف يتجاوز 5 ميجابايت');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('نوع الملف غير مدعوم. الأنواع المقبولة: PNG, JPEG, WebP, GIF');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange('imageUrl', dataUrl);
      setImageError(false);
    };
    reader.onerror = () => {
      setUploadError('حدث خطأ أثناء قراءة الملف');
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFile]);

  const handleRemoveImage = () => {
    onChange('imageUrl', '');
    setImageError(false);
    setUploadError(null);
  };

  /* ===== Sparkle Button Component ===== */

  const SparkleButton = () => (
    <button
      type="button"
      onClick={() => setAiPopupOpen(true)}
      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-200/50 transition-all group"
      title="توليد بالذكاء الاصطناعي"
    >
      <Sparkles className="w-3.5 h-3.5 text-purple-500 group-hover:text-purple-600 transition-colors" />
      <span className="text-[10px] font-bold text-purple-500 group-hover:text-purple-600 transition-colors">AI</span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-slate-700">
              عنوان <span className="text-rose-500">*</span>
            </label>
            <SparkleButton />
          </div>
          <span
            className={`text-xs font-bold tabular-nums ${
              title.length > 90 ? 'text-rose-500' : 'text-slate-400'
            }`}
          >
            {title.length}/100
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= 100) onChange('title', e.target.value);
          }}
          {...focusHandlers('title')}
          placeholder="عنوان الإشعار..."
          className={INPUT_CLASSES}
          dir="rtl"
        />
      </div>

      {/* Short Message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">
            رسالة مختصرة <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-xs font-bold tabular-nums ${
              shortMessage.length > 180 ? 'text-rose-500' : 'text-slate-400'
            }`}
          >
            {shortMessage.length}/200
          </span>
        </div>
        <textarea
          value={shortMessage}
          onChange={(e) => {
            if (e.target.value.length <= 200) onChange('shortMessage', e.target.value);
          }}
          {...focusHandlers('shortMessage')}
          placeholder="رسالة مختصرة تظهر في الإشعارات السريعة..."
          rows={2}
          className={`${INPUT_CLASSES} resize-none`}
          dir="rtl"
        />
      </div>

      {/* Full Message */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-slate-700">الرسالة الكاملة</label>
          <SparkleButton />
        </div>
        {/* Decorative toolbar */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 w-fit">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
            title="غامق"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
            title="مائل"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
            title="رابط"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={body}
          onChange={(e) => onChange('body', e.target.value)}
          {...focusHandlers('body')}
          placeholder="اكتب الرسالة الكاملة هنا... (اختياري)"
          rows={6}
          className={`${INPUT_CLASSES} resize-none`}
          dir="rtl"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Image className="w-4 h-4 text-slate-400" />
          صورة
        </label>
        <p className="text-xs text-slate-400">PNG, JPEG, WebP, GIF — حتى 5 ميجابايت</p>

        {/* Show preview if image exists, otherwise show upload zone */}
        {imageUrl ? (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              {imageError ? (
                <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center text-sm text-slate-400 font-bold">
                  تعذّر تحميل الصورة
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt="معاينة"
                  onError={() => setImageError(true)}
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
                />
              )}
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 start-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging
                  ? 'border-duo-purple bg-violet-50/60'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isDragging ? 'bg-violet-100' : 'bg-slate-100'
              }`}>
                <Upload className={`w-6 h-6 transition-colors ${
                  isDragging ? 'text-duo-purple' : 'text-slate-400'
                }`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500">
                  اسحب الصورة هنا أو
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1.5 text-sm font-bold text-duo-purple hover:text-purple-600 transition-colors underline underline-offset-2"
                >
                  اختر ملف
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Upload Error */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <p className="text-xs font-bold text-rose-500">{uploadError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* URL Fallback Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
              >
                أو الصق رابط
              </button>
            </div>

            {/* URL Input (fallback) */}
            <AnimatePresence>
              {showUrlInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      onChange('imageUrl', e.target.value);
                      setImageError(false);
                    }}
                    {...focusHandlers('imageUrl')}
                    placeholder="https://example.com/image.png"
                    className={INPUT_CLASSES}
                    dir="ltr"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <button
          type="button"
          onClick={handleCtaToggle}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-slate-400" />
            زر الإجراء
            <span className="text-xs font-medium text-slate-400">(اختياري)</span>
          </span>
          {ctaExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {ctaExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">نص الزر</label>
                <input
                  type="text"
                  value={ctaButton?.label || ''}
                  onChange={(e) => handleCtaChange('label', e.target.value)}
                  {...focusHandlers('ctaButton')}
                  placeholder="مثال: عرض التفاصيل"
                  className={INPUT_CLASSES}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">رابط الزر</label>
                <input
                  type="url"
                  value={ctaButton?.url || ''}
                  onChange={(e) => handleCtaChange('url', e.target.value)}
                  {...focusHandlers('ctaButton')}
                  placeholder="https://..."
                  className={INPUT_CLASSES}
                  dir="ltr"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== AI Writer Popup (Overlay) ===== */}
      <AnimatePresence>
        {aiPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={handleCloseAI}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">كتابة بالذكاء الاصطناعي</h4>
                    <p className="text-[10px] font-bold text-slate-400">Gemini AI</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseAI}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">صف ما تريد كتابته</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="صف ما تريد كتابته..."
                    rows={3}
                    className={`${INPUT_CLASSES} resize-none`}
                    dir="rtl"
                    disabled={aiLoading}
                  />
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={generateWithAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جارٍ التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      توليد بالذكاء الاصطناعي
                    </>
                  )}
                </button>

                {/* Error */}
                <AnimatePresence>
                  {aiError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                        <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <p className="text-xs font-bold text-rose-500">{aiError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result Preview */}
                <AnimatePresence>
                  {aiResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">العنوان</span>
                          <p className="text-sm font-bold text-slate-800">{aiResult.title}</p>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الرسالة المختصرة</span>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">{aiResult.shortMessage}</p>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">المحتوى</span>
                          <p className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">{aiResult.body}</p>
                        </div>
                      </div>

                      {/* Accept / Regenerate buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAcceptAI}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
                        >
                          قبول
                        </button>
                        <button
                          type="button"
                          onClick={generateWithAI}
                          disabled={aiLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {aiLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              إعادة التوليد
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
