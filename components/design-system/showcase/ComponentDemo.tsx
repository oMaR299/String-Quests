/**
 * ComponentDemo — reusable demo wrapper.
 * Renders: title + description + live example (children) + controls slot
 * + JSX snippet + click-to-copy.
 */

import React from 'react';
import { CodeSnippet } from './CodeSnippet';

interface ComponentDemoProps {
  title: string;
  description?: string;
  /** Optional controls panel (e.g. variant/size pickers). */
  controls?: React.ReactNode;
  /** Live demo region. */
  children: React.ReactNode;
  /** JSX snippet shown beneath the demo. */
  code: string;
  /** Optional right-aligned meta (e.g. tags). */
  meta?: React.ReactNode;
  className?: string;
}

export const ComponentDemo: React.FC<ComponentDemoProps> = ({
  title,
  description,
  controls,
  children,
  code,
  meta,
  className = '',
}) => {
  return (
    <div
      className={`rounded-3xl bg-white border border-slate-200 overflow-hidden font-cairo ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {meta && <div className="shrink-0">{meta}</div>}
      </div>

      {/* Controls (optional) */}
      {controls && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">{controls}</div>
      )}

      {/* Live example */}
      <div className="p-6 lg:p-8 bg-gradient-to-b from-sq-cloud to-white">
        <div className="flex items-center justify-center min-h-[120px]">{children}</div>
      </div>

      {/* Snippet */}
      <div className="px-5 py-4 bg-slate-900/[0.02] border-t border-slate-100">
        <CodeSnippet code={code} />
      </div>
    </div>
  );
};

export default ComponentDemo;
