/**
 * CodeSnippet — small monospaced code block with click-to-copy.
 * Plain monospace (no Prism) — keeps the design system free of new deps.
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = 'tsx',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard not available — silent fail */
    }
  };
  return (
    <div
      className={`group relative rounded-xl bg-slate-900 text-slate-100 overflow-hidden ${className}`}
      dir="ltr"
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/60 border-b border-slate-700/50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="px-3 py-2.5 text-[11.5px] leading-relaxed overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
