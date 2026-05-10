/**
 * Patterns tab — composite recipes (AdminShell, FormSection, DeleteAffordance).
 * Each pattern explains "when to use" + "when NOT to use".
 */

import React, { useState } from 'react';
import {
  LayoutGrid,
  Send,
  CalendarDays,
  Sparkles,
  Megaphone,
  Trash2,
  ListChecks,
} from 'lucide-react';
import { SqButton, SqInput, SqSelect, SqPill } from '../components';
import { SqAdminShell, SqFormSection, SqDeleteAffordance } from '../patterns';
import { ComponentDemo } from './ComponentDemo';

export const DesignSystemPatternsTab: React.FC = () => {
  return (
    <div className="font-cairo space-y-6">
      <AdminShellPattern />
      <FormSectionPattern />
      <DeletePattern />
    </div>
  );
};

/* ── AdminShell ───────────────────────────────────────────────────────── */

const AdminShellPattern: React.FC = () => {
  const [tab, setTab] = useState('overview');
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-base font-black text-slate-900">AdminShell</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
            Sticky header + tab pills + scrollable main pane. Use as the chrome of any admin
            module (Topic Manager, Schedule, Notification Admin all use this shape).
          </p>
        </div>
        <div className="shrink-0 hidden md:flex flex-col gap-1.5 text-[10px] font-bold">
          <UseTag good>For multi-tab admin pages</UseTag>
          <UseTag>Not for single-page settings</UseTag>
        </div>
      </div>

      {/* Embedded shell preview */}
      <div className="bg-slate-100 p-4">
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-[420px]">
          <SqAdminShell
            title="Class dashboard"
            eyebrow="Topic manager"
            tabs={[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'units',    label: 'Units',    icon: ListChecks },
              { id: 'reports',  label: 'Reports',  icon: Sparkles },
            ]}
            activeTab={tab}
            onTabChange={setTab}
            rightSlot={
              <SqPill variant="soft">Mock</SqPill>
            }
          >
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {tab === 'overview' && 'Year 7 — Section A'}
                {tab === 'units'    && 'Curriculum units'}
                {tab === 'reports'  && 'Reports'}
              </h2>
              <p className="text-sm text-slate-500 max-w-prose leading-relaxed">
                The shell handles sticky headers, tab pills with morphing active marker, and
                animated content transitions. Drop your tab body into <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">{'{children}'}</code>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Mastery', 'Hours', 'Engagement'].map((k) => (
                  <div key={k} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {k}
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{Math.floor(Math.random() * 40) + 60}%</div>
                  </div>
                ))}
              </div>
            </div>
          </SqAdminShell>
        </div>
      </div>
    </div>
  );
};

/* ── FormSection ──────────────────────────────────────────────────────── */

const FormSectionPattern: React.FC = () => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('inApp');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-base font-black text-slate-900">FormSection</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
            Composes <span className="font-mono">SqCard</span> (variant=section) with consistent
            inner spacing rhythm. Use whenever a form needs labelled groups.
          </p>
        </div>
        <div className="shrink-0 hidden md:flex flex-col gap-1.5 text-[10px] font-bold">
          <UseTag good>For multi-section forms</UseTag>
          <UseTag>Not for inline 1-field forms</UseTag>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-sq-cloud to-white">
        <div className="space-y-5 max-w-2xl mx-auto">
          <SqFormSection
            tone="brand"
            icon={Megaphone}
            titleAr="محتوى الإعلان"
            titleEn="Announcement"
            subtitleAr="ما تريد إرساله للطلاب"
            subtitleEn="What you'd like to send"
            status={name.length > 0 ? 'complete' : 'incomplete'}
            locale="en"
          >
            <SqInput
              label="Headline"
              placeholder="Type your headline…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              locale="en"
            />
            <SqInput
              variant="textarea"
              label="Body"
              placeholder="Body text…"
              locale="en"
            />
          </SqFormSection>

          <SqFormSection
            tone="info"
            icon={Send}
            titleAr="القنوات"
            titleEn="Channels"
            subtitleAr="أين سيظهر هذا الإعلان"
            subtitleEn="Where this announcement appears"
            status={channel ? 'complete' : 'incomplete'}
            locale="en"
          >
            <SqSelect
              label="Primary channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              options={[
                { value: 'inApp', label: 'In-app banner' },
                { value: 'push', label: 'Push notification' },
                { value: 'email', label: 'Email' },
              ]}
              locale="en"
            />
          </SqFormSection>
        </div>
      </div>
    </div>
  );
};

/* ── DeleteAffordance ─────────────────────────────────────────────────── */

const DeletePattern: React.FC = () => {
  const [deletedCount, setDeletedCount] = useState(0);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-base font-black text-slate-900">DeleteAffordance</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
            A destructive button + confirm flow primitive. Encodes the rule that EVERY destructive
            action must pass through a confirm dialog — never <span className="font-mono">window.confirm</span>.
          </p>
        </div>
        <div className="shrink-0 hidden md:flex flex-col gap-1.5 text-[10px] font-bold">
          <UseTag good>For irreversible deletions</UseTag>
          <UseTag>Not for "remove from list" (no data loss)</UseTag>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-sq-cloud to-white">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">Year 7 — Section A</div>
              <div className="text-[11px] text-slate-500 mt-0.5">28 students · Created 2024-09-01</div>
            </div>
            <SqDeleteAffordance
              label="Delete"
              confirmTitle="Delete this class?"
              confirmBody="The class roster, schedule and announcements will be permanently removed."
              confirmLabel="Delete class"
              cancelLabel="Keep"
              locale="en"
              onDelete={() => setDeletedCount((c) => c + 1)}
              size="sm"
            />
          </div>
          {deletedCount > 0 && (
            <div className="mt-3 rounded-xl bg-sq-success-50 border border-sq-success-200 px-3 py-2 flex items-center gap-2 text-[11px] font-bold text-sq-success-700">
              <Trash2 className="w-3.5 h-3.5" />
              Confirmed {deletedCount} time{deletedCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Tag chips ─────────────────────────────────────────────────────────── */

const UseTag: React.FC<{ good?: boolean; children: React.ReactNode }> = ({ good, children }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
      good
        ? 'bg-sq-success-50 text-sq-success-700 border border-sq-success-200'
        : 'bg-slate-100 text-slate-500 border border-slate-200'
    }`}
  >
    <span>{good ? '✓' : '×'}</span>
    {children}
  </span>
);

void CalendarDays;

export default DesignSystemPatternsTab;
