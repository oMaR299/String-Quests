/**
 * SwatchCard — color swatch tile with hex + token name + click-to-copy.
 * Clicking the hex copies the hex; clicking the token copies the token.
 */

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface SwatchCardProps {
  token: string;
  hex: string;
  bgClass: string;
  /** When true, the tile uses dark text (light backgrounds). */
  textOnLight?: boolean;
}

export const SwatchCard: React.FC<SwatchCardProps> = ({
  token,
  hex,
  bgClass,
  textOnLight = false,
}) => {
  const [copied, setCopied] = useState<'token' | 'hex' | 'class' | null>(null);

  const copy = async (which: 'token' | 'hex' | 'class', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      /* silent */
    }
  };

  const tone = textOnLight ? 'text-slate-700' : 'text-white';

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-sq-brand-200 hover:shadow-sm transition-all">
      <div
        className={`${bgClass} ${tone} h-20 flex items-end p-3 relative`}
      >
        <button
          onClick={() => copy('class', `bg-${token}`)}
          className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
            textOnLight ? 'bg-slate-900/10 hover:bg-slate-900/20' : 'bg-white/15 hover:bg-white/25'
          }`}
          title="Copy bg-* class"
        >
          {copied === 'class' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          class
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{token.split('-')[0]}</span>
      </div>
      <div className="p-3 space-y-1">
        <button
          onClick={() => copy('token', token)}
          className="w-full text-start font-cairo text-[12px] font-bold text-slate-800 truncate hover:text-sq-brand-600 transition-colors"
          title="Copy token name"
        >
          {token}
          {copied === 'token' && (
            <span className="ms-1 text-[10px] text-sq-success-600">copied</span>
          )}
        </button>
        <button
          onClick={() => copy('hex', hex)}
          className="w-full text-start font-mono text-[11px] text-slate-500 hover:text-sq-brand-600 transition-colors"
          title="Copy hex"
        >
          {hex}
          {copied === 'hex' && (
            <span className="ms-1 text-[10px] text-sq-success-600">copied</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SwatchCard;
