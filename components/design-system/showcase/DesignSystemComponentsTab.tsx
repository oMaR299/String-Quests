/**
 * Components tab — every primitive live with controls.
 * Categories: Buttons / Cards / Inputs / Dialogs / Status / Navigation / Charts.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Inbox,
  Bell,
  CalendarDays,
  Users,
  Star,
  ListChecks,
} from 'lucide-react';
import {
  SqButton,
  SqCard,
  SqDialog,
  SqInput,
  SqSelect,
  SqPill,
  SqToast,
  SqEmptyState,
  SqAnchoringRail,
  SqProgressDots,
  SqDeviceFrame,
  SqStatusBar,
  SqBadgeAnchor,
  SqAvatar,
  SqBar,
  SqHeatmap,
  SqDonut,
  type SqButtonVariant,
  type SqButtonTone,
  type SqButtonSize,
} from '../components';
import { ComponentDemo } from './ComponentDemo';

const CATEGORIES = [
  { id: 'buttons',    label: 'Buttons' },
  { id: 'cards',      label: 'Cards' },
  { id: 'inputs',     label: 'Inputs' },
  { id: 'dialogs',    label: 'Dialogs' },
  { id: 'status',     label: 'Status' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'charts',     label: 'Charts' },
] as const;

type Category = (typeof CATEGORIES)[number]['id'];

export const DesignSystemComponentsTab: React.FC = () => {
  const [active, setActive] = useState<Category>('buttons');
  return (
    <div className="font-cairo space-y-5">
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto -mx-4 px-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
              active === c.id
                ? 'bg-sq-brand-500 text-white shadow-sm shadow-violet-500/30'
                : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {active === 'buttons' && <ButtonsSection />}
        {active === 'cards' && <CardsSection />}
        {active === 'inputs' && <InputsSection />}
        {active === 'dialogs' && <DialogsSection />}
        {active === 'status' && <StatusSection />}
        {active === 'navigation' && <NavigationSection />}
        {active === 'charts' && <ChartsSection />}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Buttons                                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

const ButtonsSection: React.FC = () => {
  const [variant, setVariant] = useState<SqButtonVariant>('3d');
  const [tone, setTone] = useState<SqButtonTone>('brand');
  const [size, setSize] = useState<SqButtonSize>('md');
  const [loading, setLoading] = useState(false);
  const [withIcon, setWithIcon] = useState(true);

  const code = `<SqButton
  variant="${variant}"
  tone="${tone}"
  size="${size}"${withIcon ? '\n  leadingIcon={Sparkles}' : ''}${loading ? '\n  loading' : ''}
>
  Confirm
</SqButton>`;

  const Controls = (
    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
      <ControlGroup label="Variant">
        {(['3d', 'solid', 'outline', 'ghost', 'link'] as SqButtonVariant[]).map((v) => (
          <Toggle key={v} active={variant === v} onClick={() => setVariant(v)}>
            {v}
          </Toggle>
        ))}
      </ControlGroup>
      <ControlGroup label="Tone">
        {(['brand', 'success', 'warning', 'danger', 'neutral'] as SqButtonTone[]).map((t) => (
          <Toggle key={t} active={tone === t} onClick={() => setTone(t)}>
            {t}
          </Toggle>
        ))}
      </ControlGroup>
      <ControlGroup label="Size">
        {(['sm', 'md', 'lg'] as SqButtonSize[]).map((s) => (
          <Toggle key={s} active={size === s} onClick={() => setSize(s)}>
            {s}
          </Toggle>
        ))}
      </ControlGroup>
      <ControlGroup label="State">
        <Toggle active={loading} onClick={() => setLoading((v) => !v)}>
          loading
        </Toggle>
        <Toggle active={withIcon} onClick={() => setWithIcon((v) => !v)}>
          icon
        </Toggle>
      </ControlGroup>
    </div>
  );

  return (
    <div className="space-y-5">
      <ComponentDemo
        title="Button"
        description="Primary primitive. The 3D variant is the iconic Duolingo press; reserve for primary CTAs."
        controls={Controls}
        code={code}
      >
        <SqButton
          variant={variant}
          tone={tone}
          size={size}
          loading={loading}
          leadingIcon={withIcon ? Sparkles : undefined}
        >
          Confirm
        </SqButton>
      </ComponentDemo>

      <ComponentDemo
        title="Button gallery"
        description="At-a-glance comparison of every variant + tone."
        code={`<SqButton variant="3d" tone="brand">…</SqButton>
<SqButton variant="solid" tone="success">…</SqButton>
<SqButton variant="outline" tone="danger">…</SqButton>
<SqButton variant="ghost" tone="neutral">…</SqButton>`}
      >
        <div className="space-y-4 w-full">
          {(['3d', 'solid', 'outline', 'ghost'] as SqButtonVariant[]).map((v) => (
            <div key={v} className="flex flex-wrap items-center justify-center gap-3">
              <span className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {v}
              </span>
              {(['brand', 'success', 'warning', 'danger', 'neutral'] as SqButtonTone[]).map((t) => (
                <SqButton key={t} variant={v} tone={t} size="sm" leadingIcon={Sparkles}>
                  {t}
                </SqButton>
              ))}
            </div>
          ))}
        </div>
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Cards                                                                    */
/* ════════════════════════════════════════════════════════════════════════ */

const CardsSection: React.FC = () => {
  const [selected, setSelected] = useState<'a' | 'b' | null>('a');

  return (
    <div className="space-y-5">
      <ComponentDemo
        title="Card · Glass"
        description="Used in admin shells (NotificationAdmin, TopicManager). bg-white/80 + backdrop-blur."
        code={`<SqCard variant="glass">
  <h3 className="text-base font-bold text-slate-800">Glass card</h3>
  <p className="text-sm text-slate-500 mt-1">Used in admin chrome.</p>
</SqCard>`}
      >
        <SqCard variant="glass" className="max-w-md w-full">
          <h3 className="text-base font-bold text-slate-800">Glass card</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Subtle backdrop blur over the page wash. Used as the chrome of admin surfaces.
          </p>
        </SqCard>
      </ComponentDemo>

      <ComponentDemo
        title="Card · Solid (selectable)"
        description="Used in the Phone App. bg-white + thick borders + tone-colored 4px bottom shadow when selected."
        code={`<SqCard
  variant="solid"
  tone="brand"
  selected={selected}
  interactive
  onClick={() => setSelected(true)}
>
  …
</SqCard>`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {(['a', 'b'] as const).map((id) => (
            <SqCard
              key={id}
              variant="solid"
              tone="brand"
              interactive
              selected={selected === id}
              onClick={() => setSelected(id)}
            >
              <div className="flex items-center gap-3">
                <SqAvatar variant="emoji" emoji={id === 'a' ? '🎓' : '🧪'} size="md" tone={id === 'a' ? 'brand' : 'success'} />
                <div className="text-start">
                  <div className="text-sm font-bold text-slate-800">
                    Option {id.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-500">Click to select</div>
                </div>
              </div>
            </SqCard>
          ))}
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Card · Section"
        description="Glass + gradient icon tile + heading + status pill. Used in NotificationAdmin compose."
        code={`<SqCard
  variant="section"
  tone="brand"
  icon={Sparkles}
  titleAr="محتوى الإشعار"
  titleEn="Content"
  subtitleEn="Headline + body"
  status="complete"
  locale="en"
>
  …
</SqCard>`}
      >
        <SqCard
          variant="section"
          tone="brand"
          icon={Sparkles}
          titleAr="محتوى الإشعار"
          titleEn="Content"
          subtitleAr="عنوان + نص الإشعار"
          subtitleEn="Headline + body of the notification"
          status="complete"
          locale="en"
          className="w-full max-w-2xl"
        >
          <div className="space-y-4">
            <SqInput label="Headline" placeholder="Type a headline…" locale="en" />
            <SqInput
              variant="textarea"
              label="Body"
              placeholder="Body text…"
              locale="en"
            />
          </div>
        </SqCard>
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Inputs                                                                   */
/* ════════════════════════════════════════════════════════════════════════ */

const InputsSection: React.FC = () => {
  const [code, setCode] = useState('');
  return (
    <div className="space-y-5">
      <ComponentDemo
        title="Input · text / email / phone"
        description="Label + helper + error states. Phone has an inline country prefix pill."
        code={`<SqInput label="Full name" placeholder="Type…" locale="en" />
<SqInput variant="email" label="Email" placeholder="you@school.sa" locale="en" />
<SqInput variant="phone" label="Mobile" prefix="+966" placeholder="5xxxxxxxx" locale="en" />`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          <SqInput label="Full name" placeholder="Type…" locale="en" />
          <SqInput variant="email" label="Email" placeholder="you@school.sa" locale="en" />
          <SqInput variant="phone" label="Mobile" prefix="+966" placeholder="5xxxxxxxx" locale="en" />
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Input · code"
        description="Big monospace, paste-friendly. Use for OTP entry."
        code={`<SqInput variant="code" placeholder="••••••" maxLength={6}
  value={code} onChange={e => setCode(e.target.value)} />`}
      >
        <div className="w-full max-w-xs">
          <SqInput
            variant="code"
            placeholder="••••••"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
            locale="en"
          />
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Input · error state"
        description="Tints the border to danger and replaces helper text."
        code={`<SqInput
  label="Email"
  defaultValue="not-an-email"
  error="Enter a valid school email."
  locale="en"
/>`}
      >
        <div className="w-full max-w-md">
          <SqInput
            label="Email"
            defaultValue="not-an-email"
            error="Enter a valid school email."
            locale="en"
          />
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Select"
        description="Native <select> wrapped with consistent styling."
        code={`<SqSelect
  label="Subject"
  options={[
    { value: 'math', label: 'Mathematics' },
    { value: 'sci',  label: 'Science' },
  ]}
  locale="en"
/>`}
      >
        <div className="w-full max-w-md">
          <SqSelect
            label="Subject"
            options={[
              { value: 'math', label: 'Mathematics' },
              { value: 'sci', label: 'Science' },
              { value: 'lang', label: 'Languages' },
            ]}
            locale="en"
          />
        </div>
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Dialogs                                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

const DialogsSection: React.FC = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptValue, setPromptValue] = useState('');

  return (
    <div className="space-y-5">
      <ComponentDemo
        title="Dialog · confirm"
        description="Yes / no with brand-tone header. The confirm button auto-focuses on open."
        code={`<SqDialog
  open={open}
  variant="confirm"
  title="Save changes?"
  body="Your edits will be applied immediately."
  onConfirm={() => …}
  onCancel={() => setOpen(false)}
  locale="en"
/>`}
      >
        <SqButton onClick={() => setConfirmOpen(true)}>Open confirm</SqButton>
        <SqDialog
          open={confirmOpen}
          variant="confirm"
          title="Save changes?"
          body="Your edits will be applied immediately and announced to your class."
          locale="en"
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo
        title="Dialog · destructive"
        description="The destructive flag flips the header to danger-rose."
        code={`<SqDialog
  open={open}
  variant="confirm"
  destructive
  title="Delete announcement?"
  body="This cannot be undone."
  confirmLabel="Delete"
  onConfirm={…}
  onCancel={…}
/>`}
      >
        <SqButton tone="danger" onClick={() => setDestOpen(true)}>
          Open destructive
        </SqButton>
        <SqDialog
          open={destOpen}
          variant="confirm"
          destructive
          title="Delete announcement?"
          body="This cannot be undone."
          confirmLabel="Delete"
          locale="en"
          onConfirm={() => setDestOpen(false)}
          onCancel={() => setDestOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo
        title="Dialog · info"
        description="Single-action acknowledgement. No cancel button."
        code={`<SqDialog
  open={open}
  variant="info"
  title="Saved"
  body="Your draft was saved to the cloud."
  onConfirm={…}
  onCancel={…}
/>`}
      >
        <SqButton variant="ghost" onClick={() => setInfoOpen(true)}>
          Open info
        </SqButton>
        <SqDialog
          open={infoOpen}
          variant="info"
          title="Saved"
          body="Your draft was saved to the cloud and will sync to all signed-in devices."
          locale="en"
          onConfirm={() => setInfoOpen(false)}
          onCancel={() => setInfoOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo
        title="Dialog · prompt"
        description="One-field rename / quick-add flow. Enter submits; Escape cancels."
        code={`<SqDialog
  open={open}
  variant="prompt"
  title="Rename class"
  placeholder="New name…"
  initialValue="Year 7 — Section A"
  onConfirm={(value) => …}
  onCancel={…}
/>`}
      >
        <SqButton variant="outline" onClick={() => setPromptOpen(true)}>
          Open prompt
        </SqButton>
        <SqDialog
          open={promptOpen}
          variant="prompt"
          title="Rename class"
          placeholder="New name…"
          initialValue="Year 7 — Section A"
          locale="en"
          onConfirm={(v) => {
            setPromptValue(v ?? '');
            setPromptOpen(false);
          }}
          onCancel={() => setPromptOpen(false)}
        />
        {promptValue && (
          <div className="mt-3 text-[11px] font-bold text-sq-brand-700">
            You typed: <span className="font-mono">{promptValue}</span>
          </div>
        )}
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Status                                                                   */
/* ════════════════════════════════════════════════════════════════════════ */

const StatusSection: React.FC = () => {
  const [toastOpen, setToastOpen] = useState(false);
  return (
    <div className="space-y-5">
      <ComponentDemo
        title="Pill"
        description="Filter chips, status indicators, soft tags."
        code={`<SqPill variant="success" dot>Mastered</SqPill>
<SqPill variant="warning" dot>Needs review</SqPill>
<SqPill variant="danger" dot>At risk</SqPill>`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SqPill variant="default" dot>Default</SqPill>
          <SqPill variant="accent">Accent</SqPill>
          <SqPill variant="soft">Soft</SqPill>
          <SqPill variant="success" dot>Success</SqPill>
          <SqPill variant="warning" dot>Warning</SqPill>
          <SqPill variant="danger" dot>Danger</SqPill>
          <SqPill variant="info" dot>Info</SqPill>
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Toast"
        description="Top-floating, auto-dismiss after 3.2s. Variants: info / success / warning / error."
        code={`<SqToast
  open={open}
  variant="success"
  title="Saved"
  body="Your changes will be visible within a minute."
  onClose={…}
/>`}
      >
        <SqButton tone="success" onClick={() => setToastOpen(true)}>
          Show toast
        </SqButton>
        <SqToast
          open={toastOpen}
          variant="success"
          title="Saved"
          body="Your changes will be visible within a minute."
          onClose={() => setToastOpen(false)}
        />
      </ComponentDemo>

      <ComponentDemo
        title="Empty state"
        description="Use when a list / view has no items and the user needs guidance."
        code={`<SqEmptyState
  icon={Inbox}
  tone="brand"
  title="No notifications yet"
  body="When you publish your first announcement, it'll show up here."
  cta={<SqButton leadingIcon={Send}>Compose</SqButton>}
/>`}
      >
        <SqEmptyState
          icon={Inbox}
          tone="brand"
          title="No notifications yet"
          body="When you publish your first announcement, it'll show up here."
          cta={<SqButton leadingIcon={Send}>Compose</SqButton>}
        />
      </ComponentDemo>

      <ComponentDemo
        title="Avatar"
        description="Emoji / initials / photo / icon variants."
        code={`<SqAvatar variant="emoji" emoji="🎓" tone="brand" size="md" />
<SqAvatar variant="initials" initials="AS" tone="success" size="md" />
<SqAvatar variant="icon" icon={Star} tone="warning" size="md" />`}
      >
        <div className="flex items-center justify-center gap-3">
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <SqAvatar key={s} variant="emoji" emoji="🎓" tone="brand" size={s} />
          ))}
          <SqAvatar variant="initials" initials="AS" tone="success" size="lg" />
          <SqAvatar variant="icon" icon={Star} tone="warning" size="lg" />
        </div>
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Navigation                                                               */
/* ════════════════════════════════════════════════════════════════════════ */

const NavigationSection: React.FC = () => {
  const [activeRail, setActiveRail] = useState('section-content');
  const [step, setStep] = useState(2);
  return (
    <div className="space-y-5">
      <ComponentDemo
        title="ProgressDots · thread"
        description="The brand 'string' progress: dots threaded by a curved line that draws itself."
        code={`<SqProgressDots total={5} active={2} />`}
        controls={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Step</span>
            {[0, 1, 2, 3, 4].map((s) => (
              <Toggle key={s} active={step === s} onClick={() => setStep(s)}>
                {s + 1}
              </Toggle>
            ))}
          </div>
        }
      >
        <div className="space-y-4 w-full max-w-md">
          <SqProgressDots total={5} active={step} />
          <SqProgressDots total={5} active={step} variant="dots" />
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Anchoring rail"
        description="Vertical scroll-spy rail. The active dot morphs with layoutId. Horizontal pill bar variant for mobile."
        code={`<SqAnchoringRail
  sections={[
    { id: 'section-content',   label: 'Content',   icon: Sparkles, complete: true  },
    { id: 'section-channels',  label: 'Channels',  icon: Send,     complete: false },
    { id: 'section-priority',  label: 'Priority',  icon: Star,     complete: 'optional' },
  ]}
  activeId={activeId}
  onActivate={setActiveId}
/>`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Vertical
            </div>
            <SqAnchoringRail
              variant="vertical"
              sections={[
                { id: 'section-content', label: 'Content', icon: Sparkles, complete: true },
                { id: 'section-channels', label: 'Channels', icon: Send, complete: false },
                { id: 'section-priority', label: 'Priority', icon: Star, complete: 'optional' },
                { id: 'section-audience', label: 'Audience', icon: Users, complete: true },
              ]}
              activeId={activeRail}
              onActivate={setActiveRail}
              sticky={false}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3">
              Horizontal
            </div>
            <SqAnchoringRail
              variant="horizontal"
              sticky={false}
              sections={[
                { id: 'section-content', label: 'Content', icon: Sparkles, complete: true },
                { id: 'section-channels', label: 'Channels', icon: Send, complete: false },
                { id: 'section-priority', label: 'Priority', icon: Star, complete: 'optional' },
                { id: 'section-audience', label: 'Audience', icon: Users, complete: true },
              ]}
              activeId={activeRail}
              onActivate={setActiveRail}
            />
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="DeviceFrame"
        description="Wrap any preview in desktop / tablet / mobile chrome."
        code={`<SqDeviceFrame mode="mobile">
  <YourPreview />
</SqDeviceFrame>`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <SqDeviceFrame mode="desktop">
            <div className="text-center text-[11px] font-bold text-slate-500 py-6">
              Desktop chrome
            </div>
          </SqDeviceFrame>
          <SqDeviceFrame mode="mobile">
            <div className="text-center text-[11px] font-bold text-slate-500 py-12">
              Mobile chrome
            </div>
          </SqDeviceFrame>
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="StatusBar + BadgeAnchor"
        description="iOS-style status bar (RTL aware) and a directional floating badge anchor."
        code={`<SqStatusBar variant="dark" rtl />

<button className="relative …">
  <Bell className="w-6 h-6" />
  <SqBadgeAnchor>
    <span className="px-1.5 py-0.5 rounded-full bg-sq-danger-500 text-white text-[10px] font-black">3</span>
  </SqBadgeAnchor>
</button>`}
      >
        <div className="space-y-4 w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <SqStatusBar variant="dark" rtl />
          </div>
          <div className="flex items-center justify-center gap-6">
            <button className="relative inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 text-slate-700">
              <Bell className="w-5 h-5" />
              <SqBadgeAnchor>
                <span className="px-1.5 py-0.5 rounded-full bg-sq-danger-500 text-white text-[10px] font-black shadow-sm">
                  3
                </span>
              </SqBadgeAnchor>
            </button>
          </div>
        </div>
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Charts                                                                   */
/* ════════════════════════════════════════════════════════════════════════ */

const ChartsSection: React.FC = () => {
  return (
    <div className="space-y-5">
      <ComponentDemo
        title="Bar"
        description="Horizontal progress bar with label + percentage."
        code={`<SqBar value={72} label="Mastery" tone="brand" />
<SqBar value={48} label="Practice"  tone="warning" />
<SqBar value={94} label="Streak"    tone="success" compact />`}
      >
        <div className="space-y-3 w-full max-w-md">
          <SqBar value={72} label="Mastery" tone="brand" />
          <SqBar value={48} label="Practice" tone="warning" />
          <SqBar value={94} label="Streak" tone="success" compact />
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Donut"
        description="Library-free SVG donut. Pass any number of segments."
        code={`<SqDonut
  segments={[
    { value: 64, color: '#8B5CF6' },
    { value: 24, color: '#10B981' },
    { value: 12, color: '#F59E0B' },
  ]}
  centerLabel="64%"
  centerSubLabel="Mastered"
/>`}
      >
        <div className="flex flex-wrap items-center justify-center gap-8">
          <SqDonut
            segments={[
              { value: 64, color: '#8B5CF6' },
              { value: 24, color: '#10B981' },
              { value: 12, color: '#F59E0B' },
            ]}
            centerLabel="64%"
            centerSubLabel="Mastered"
            size={120}
          />
          <SqDonut
            segments={[{ value: 88, color: '#10B981' }]}
            centerLabel="88"
            centerSubLabel="streak"
            size={120}
          />
        </div>
      </ComponentDemo>

      <ComponentDemo
        title="Heatmap"
        description="Library-free grid heatmap. Configurable rows / cols / tone ramp."
        code={`<SqHeatmap
  rows={7} cols={12}
  cells={[…]}
  tone="brand"
/>`}
      >
        <SqHeatmap
          rows={7}
          cols={14}
          cells={Array.from({ length: 50 }).map(() => ({
            row: Math.floor(Math.random() * 7),
            col: Math.floor(Math.random() * 14),
            count: Math.floor(Math.random() * 10),
          }))}
          tone="brand"
          rowLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
          tileSize={16}
        />
      </ComponentDemo>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

const ControlGroup: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className="flex items-center gap-1">{children}</div>
  </div>
);

const Toggle: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
      active
        ? 'bg-sq-brand-500 text-white'
        : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
    }`}
  >
    {children}
  </button>
);

// silence unused-import for icons used inline only in code strings
void CalendarDays;
void CheckCircle;
void AlertTriangle;
void Trash2;
void ListChecks;

export default DesignSystemComponentsTab;
