import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Mabadi Proposal — Premium Report Style
   A4 pages stacked on a gray desk; Ctrl+P gives a clean PDF.
   Arabic RTL, Cairo font, no JS animations (print-safe).
───────────────────────────────────────────────────────────── */

// ── Tiny helpers ──────────────────────────────────────────────

function Page({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`page-sheet ${className}`}>
      {children}
    </div>
  );
}

function PageHeader({ section, label }: { section: string; label: string }) {
  return (
    <div className="page-header">
      <div className="page-header-band">
        <span className="section-num">{section}</span>
        <span className="section-label">{label}</span>
      </div>
    </div>
  );
}

function PageFooter({ page, total }: { page: number; total: number }) {
  return (
    <div className="page-footer">
      <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
      <span>سري — للاطلاع المحدود فقط</span>
      <span>{page} / {total}</span>
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="two-col">{children}</div>;
}

function CalloutBox({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'amber' | 'dark' }) {
  return <div className={`callout callout-${color}`}>{children}</div>;
}

function FeatureRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="feature-row">
      <span className="feature-icon">{icon}</span>
      <div>
        <p className="feature-title">{title}</p>
        <p className="feature-body">{body}</p>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}

function DataCard({ number, label, sub }: { number: string; label: string; sub?: string }) {
  return (
    <div className="data-card">
      <p className="data-number">{number}</p>
      <p className="data-label">{label}</p>
      {sub && <p className="data-sub">{sub}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function MabadiProposal() {
  return (
    <>
      {/* ── Injected styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

        @page {
          size: A4 portrait;
          margin: 0;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #e8e8e8 !important; }

        .proposal-root {
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          background: #d8d8d8;
          min-height: 100vh;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        /* ── A4 sheet ── */
        .page-sheet {
          background: #fff;
          width: 794px;
          min-height: 1123px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Cover page ── */
        .cover-page {
          display: flex;
          flex-direction: row;
          min-height: 1123px;
        }
        .cover-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #0c1a2e;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 52px 24px;
          gap: 0;
        }
        .cover-sidebar-logo {
          width: 52px;
          height: 52px;
          background: #1e90d6;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -1px;
          margin-bottom: 16px;
          flex-shrink: 0;
        }
        .cover-sidebar-brand {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 0;
        }
        .cover-sidebar-divider {
          width: 32px;
          height: 2px;
          background: #1e90d6;
          margin: 28px 0;
        }
        .cover-sidebar-tagline {
          color: rgba(255,255,255,0.45);
          font-size: 11px;
          font-weight: 600;
          line-height: 1.7;
          text-align: center;
          writing-mode: horizontal-tb;
        }
        .cover-sidebar-bottom {
          margin-top: auto;
          color: rgba(255,255,255,0.25);
          font-size: 10px;
          text-align: center;
          line-height: 1.8;
        }
        .cover-body {
          flex: 1;
          padding: 64px 48px 48px;
          display: flex;
          flex-direction: column;
        }
        .cover-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1e90d6;
          margin-bottom: 20px;
        }
        .cover-title {
          font-size: 52px;
          font-weight: 900;
          color: #0c1a2e;
          line-height: 1.15;
          margin-bottom: 8px;
        }
        .cover-subtitle {
          font-size: 16px;
          color: #5a7a99;
          font-weight: 600;
          margin-bottom: 48px;
        }
        .cover-meta-block {
          border-top: 2px solid #e8f0fa;
          padding-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }
        .cover-meta-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cover-meta-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #1e90d6;
        }
        .cover-meta-value {
          font-size: 15px;
          font-weight: 800;
          color: #0c1a2e;
        }
        .cover-meta-sub {
          font-size: 12px;
          color: #7a94b0;
          font-weight: 500;
        }
        .cover-toc {
          margin-top: auto;
          border-top: 1px solid #e8f0fa;
          padding-top: 24px;
        }
        .cover-toc-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #9ab0c8;
          margin-bottom: 14px;
        }
        .cover-toc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 24px;
        }
        .cover-toc-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #4a6a8a;
          font-weight: 600;
        }
        .cover-toc-num {
          font-size: 10px;
          font-weight: 800;
          color: #1e90d6;
          width: 18px;
          flex-shrink: 0;
        }
        .confidential-badge {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff8e6;
          border: 1px solid #f5d470;
          color: #b48b00;
          font-size: 10px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px;
        }

        /* ── Page header band ── */
        .page-header {
          flex-shrink: 0;
        }
        .page-header-band {
          background: #0c1a2e;
          padding: 14px 48px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .section-num {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #1e90d6;
        }
        .section-label {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
        }

        /* ── Page body ── */
        .page-body {
          flex: 1;
          padding: 40px 48px;
        }

        /* ── Page footer ── */
        .page-footer {
          flex-shrink: 0;
          padding: 12px 48px;
          border-top: 1px solid #eaeef4;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          font-weight: 600;
          color: #b0bec8;
          letter-spacing: 0.5px;
        }

        /* ── Typography ── */
        .section-heading {
          font-size: 28px;
          font-weight: 900;
          color: #0c1a2e;
          line-height: 1.3;
          margin-bottom: 14px;
        }
        .section-lead {
          font-size: 14px;
          color: #4a6a8a;
          line-height: 1.85;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .body-text {
          font-size: 13px;
          color: #3a5070;
          line-height: 1.9;
          font-weight: 500;
          margin-bottom: 14px;
        }
        .body-text:last-child { margin-bottom: 0; }

        /* ── Two column ── */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        /* ── Callout boxes ── */
        .callout {
          border-radius: 8px;
          padding: 18px 20px;
          margin-bottom: 18px;
          font-size: 13px;
          line-height: 1.8;
          font-weight: 500;
        }
        .callout-blue {
          background: #f0f7ff;
          border-right: 4px solid #1e90d6;
          color: #1a4060;
        }
        .callout-green {
          background: #f0faf4;
          border-right: 4px solid #16a34a;
          color: #1a4030;
        }
        .callout-amber {
          background: #fffbf0;
          border-right: 4px solid #d97706;
          color: #5a3a00;
        }
        .callout-dark {
          background: #0c1a2e;
          border-radius: 10px;
          padding: 22px 24px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 18px;
          font-size: 13px;
          line-height: 1.8;
        }
        .callout-dark strong { color: #5bc8ff; }
        .callout strong { font-weight: 800; }

        .callout, .feature-row, .dna-card, .data-card, .skill-bar-row {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* ── Feature rows ── */
        .feature-row {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid #f0f4f8;
        }
        .feature-row:last-child { border-bottom: none; }
        .feature-icon {
          font-size: 22px;
          flex-shrink: 0;
          margin-top: 2px;
          width: 32px;
          text-align: center;
        }
        .feature-title {
          font-size: 13px;
          font-weight: 800;
          color: #0c1a2e;
          margin-bottom: 3px;
        }
        .feature-body {
          font-size: 12px;
          color: #4a6a8a;
          line-height: 1.75;
          font-weight: 500;
        }

        /* ── Data cards ── */
        .data-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .data-card {
          background: #f5f9ff;
          border: 1px solid #d8e8f8;
          border-radius: 10px;
          padding: 18px 16px;
          text-align: center;
        }
        .data-number {
          font-size: 32px;
          font-weight: 900;
          color: #0c1a2e;
          line-height: 1;
          margin-bottom: 6px;
        }
        .data-label {
          font-size: 11px;
          font-weight: 700;
          color: #4a6a8a;
          line-height: 1.5;
        }
        .data-sub {
          font-size: 10px;
          color: #9ab0c8;
          margin-top: 4px;
          font-weight: 500;
        }

        /* ── Tags ── */
        .tag {
          display: inline-flex;
          align-items: center;
          background: #edf4ff;
          color: #1a5a9a;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          margin-left: 6px;
          margin-bottom: 6px;
        }
        .tags-row { margin-bottom: 16px; }

        /* ── Numbered list ── */
        .num-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }
        .num-list li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 13px;
          color: #3a5070;
          line-height: 1.8;
          font-weight: 500;
        }
        .num-badge {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0c1a2e;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }

        /* ── Skill bar ── */
        .skill-bars { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .skill-bar-row { display: flex; flex-direction: column; gap: 4px; }
        .skill-bar-top { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #3a5070; }
        .skill-bar-track { height: 8px; background: #e8eef4; border-radius: 4px; overflow: hidden; }
        .skill-bar-fill { height: 100%; border-radius: 4px; }

        /* ── DNA layers ── */
        .dna-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .dna-card {
          border: 1px solid #e0ecf8;
          border-radius: 8px;
          padding: 16px 14px;
          background: #fafcff;
        }
        .dna-num {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #1e90d6;
          margin-bottom: 8px;
        }
        .dna-q {
          font-size: 12px;
          font-weight: 800;
          color: #0c1a2e;
          margin-bottom: 6px;
        }
        .dna-a {
          font-size: 11px;
          color: #5a7a99;
          line-height: 1.7;
          font-weight: 500;
        }

        /* ── Contact card ── */
        .contact-card {
          background: #f5f9ff;
          border: 1px solid #d0e4f8;
          border-radius: 12px;
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }
        .contact-left { flex: 1; }
        .contact-name {
          font-size: 18px;
          font-weight: 900;
          color: #0c1a2e;
          margin-bottom: 4px;
        }
        .contact-role {
          font-size: 12px;
          color: #5a7a99;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .contact-detail {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .contact-line {
          font-size: 13px;
          font-weight: 600;
          color: #1e4a7a;
        }
        .contact-right {
          width: 80px;
          height: 80px;
          background: #0c1a2e;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 900;
          color: #1e90d6;
          flex-shrink: 0;
          letter-spacing: -2px;
        }

        /* ── Print button ── */
        .print-btn {
          position: fixed;
          bottom: 32px;
          left: 32px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0c1a2e;
          color: #fff;
          font-family: 'Cairo', sans-serif;
          font-size: 13px;
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          transition: background 0.2s;
          direction: rtl;
        }
        .print-btn:hover { background: #1e3050; }
        .print-btn svg { width: 16px; height: 16px; flex-shrink: 0; }

        /* ── Spacers ── */
        .mt8  { margin-top: 8px; }
        .mt12 { margin-top: 12px; }
        .mt16 { margin-top: 16px; }
        .mt24 { margin-top: 24px; }
        .mb8  { margin-bottom: 8px; }
        .mb16 { margin-bottom: 16px; }
        .mb20 { margin-bottom: 20px; }
        .label-sm {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #1e90d6;
          margin-bottom: 10px;
        }

        /* ── Print ── */
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          body, .proposal-root {
            background: #fff !important;
            padding: 0 !important;
            gap: 0 !important;
          }

          .page-sheet {
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            overflow: visible !important;
            page-break-after: always;
            break-after: page;
          }

          .print-btn {
            display: none !important;
          }
        }
      `}</style>

      <div className="proposal-root">

        <button
          className="print-btn"
          onClick={() => window.print()}
          aria-label="طباعة / حفظ PDF"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <span>طباعة · PDF</span>
        </button>

        {/* ══════════════════════════════════════════════════
            PAGE 1 — Cover
           ══════════════════════════════════════════════════ */}
        <div className="cover-page page-sheet">
          {/* Left sidebar */}
          <div className="cover-sidebar">
            <div className="cover-sidebar-logo">S</div>
            <div className="cover-sidebar-brand">String</div>
            <div className="cover-sidebar-divider" />
            <div className="cover-sidebar-tagline">
              نظام تشغيل<br />للتعليم
            </div>
            <div className="cover-sidebar-bottom" style={{ marginTop: 'auto' }}>
              <div>© 2026</div>
              <div>String Education</div>
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.15)' }}>
                string.education
              </div>
            </div>
          </div>

          {/* Right body */}
          <div className="cover-body">
            <div className="cover-eyebrow">نظرة عامة شاملة</div>

            <div className="cover-title">
              نظام تشغيل<br />للتعليم
            </div>
            <div className="cover-subtitle">
              تعليمٌ يدرك تفرّد كل طالب
            </div>

            <div className="cover-meta-block">
              <div className="cover-meta-row">
                <div className="cover-meta-label">مُعَد لـ</div>
                <div className="cover-meta-value">مدارس المبادئ العلمية</div>
                <div className="cover-meta-sub">عناية المدير العام — المهندس محمد الملازم</div>
                <div className="cover-meta-sub">بالتنسيق مع المهندسة سلام اليوسف</div>
              </div>
              <div className="cover-meta-row">
                <div className="cover-meta-label">مُعَد من</div>
                <div className="cover-meta-value">فريق String</div>
                <div className="cover-meta-sub">عمر أبو سليم — المؤسس والرئيس التنفيذي</div>
              </div>
              <div className="cover-meta-row">
                <div className="cover-meta-label">التاريخ</div>
                <div className="cover-meta-value">يونيو ٢٠٢٦</div>
              </div>
            </div>

            <div className="cover-toc">
              <div className="cover-toc-title">محتويات الوثيقة</div>
              <div className="cover-toc-grid">
                {[
                  ['٠١', 'الفكرة والرؤية'],
                  ['٠٢', 'توظيف الذكاء الاصطناعي'],
                  ['٠٣', 'ما يميز String'],
                  ['٠٤', 'String DNA'],
                  ['٠٥', 'خريطة المهارات'],
                  ['٠٦', 'Quests'],
                  ['٠٧', 'تطبيق الأهل'],
                  ['٠٨', 'التكامل والأمان'],
                ].map(([num, label]) => (
                  <div key={num} className="cover-toc-item">
                    <span className="cover-toc-num">{num}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="confidential-badge" style={{ marginTop: 28 }}>
              🔒 سري وخاص — للاطلاع المحدود فقط
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            PAGE 2 — الفكرة والرؤية
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="٠١" label="الفكرة والرؤية" />
          <div className="page-body">
            <h2 className="section-heading">فئة جديدة بالكامل في عالم التعليم</h2>
            <p className="section-lead">
              تعاني المدارس اليوم من تشتت الأدوات: نظام للدرجات، وآخر للحضور، وثالث للتواصل مع الأهل. هذه الأنظمة المنعزلة لا تتخاطب مع بعضها، مما يترك عبء نقل المعلومات يدوياً على عاتق المعلم طوال اليوم.
            </p>

            <TwoCol>
              <div>
                <div className="label-sm">المشكلة الحالية</div>
                <p className="body-text">
                  أنظمة منعزلة لا تتحدث مع بعضها. المعلم يقضي ساعات في نقل البيانات يدوياً بدلاً من التدريس.
                </p>
                <CalloutBox color="amber">
                  <strong>النتيجة:</strong> بيانات متفرقة تجعل التخصيص مستحيلاً ومساعدة الطالب بدقة أمراً بعيد المنال.
                </CalloutBox>
              </div>
              <div>
                <div className="label-sm">حل String</div>
                <p className="body-text">
                  كما يجمع نظام iOS كل تطبيقاتك، يعمل String كنظام تشغيل شامل للمدرسة. داخله تعمل كل أدواتكم بتناغم تام.
                </p>
                <CalloutBox color="blue">
                  <strong>النتيجة:</strong> النظام يرى الصورة الأكاديمية الكاملة للطالب لأول مرة — ويتصرف بناءً عليها.
                </CalloutBox>
              </div>
            </TwoCol>

            <CalloutBox color="dark">
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.5 }}>
                "لن يتمكن أي نظام من مساعدة طالب لا يرى تفاصيل رحلته. String يرى الصورة الكاملة."
              </div>
            </CalloutBox>

            <div className="data-cards-row">
              <DataCard number="٩+" label="أنظمة تُدار بشكل منفصل في المدرسة الواحدة" sub="يمكن توحيدها في String" />
              <DataCard number="١٠ س" label="أسبوعياً يستعيدها المعلم من المهام الإدارية" />
              <DataCard number="١٢٨" label="نمطاً معرفياً مختلفاً يبنيها String لكل طالب" />
            </div>
          </div>
          <PageFooter page={2} total={8} />
        </Page>

        {/* ══════════════════════════════════════════════════
            PAGE 3 — توظيف الذكاء الاصطناعي
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="٠٢" label="توظيف الذكاء الاصطناعي" />
          <div className="page-body">
            <h2 className="section-heading">كيف نوظّف الذكاء الاصطناعي لإحداث تأثير حقيقي؟</h2>
            <p className="section-lead">
              أحدث الذكاء الاصطناعي ثورة في كل القطاعات باستثناء التعليم — لأن التعليم يتوزع بين الغرفة الصفية والمنصات والواجبات. String صُمّم ليتجاوز ثلاث حقائق جوهرية:
            </p>

            <ul className="num-list mb16">
              <li><span className="num-badge">١</span><span>لا يمكن أتمتة مهام لا يراها النظام بوضوح.</span></li>
              <li><span className="num-badge">٢</span><span>لا يمكن تخصيص تجربة التعلم دون فهم دقيق وعميق للطالب.</span></li>
              <li><span className="num-badge">٣</span><span>لا يُبنى ذكاء حقيقي استناداً إلى بيانات مشتتة.</span></li>
            </ul>

            <div className="label-sm">عندما تتكامل المنظومة: ثلاث قدرات محورية</div>

            <FeatureRow
              icon="⏱️"
              title="أتمتة تُعيد للمعلم وقته وشغفه"
              body="رصد الحضور بثوانٍ، إدخال الدرجات آلياً، وكتابة التقارير تلقائياً. كل دقيقة كانت تُهدر في الإدارة، تعود الآن للتدريس."
            />
            <FeatureRow
              icon="🧬"
              title="تجربة تعليمية تُصمم على مقاس كل طالب"
              body="يبني String ملفاً معرفياً لكل طالب يحدد آلية تفكيره ضمن 128 نمطاً مختلفاً. تتكيف صعوبة الأسئلة وأسلوب الشرح مع مستوى إتقان الطالب لكل مفهوم."
            />
            <FeatureRow
              icon="🔮"
              title="ذكاء يقرأ ما وراء الأرقام"
              body="تحليل دقيق لتحديد الفجوات المعرفية (وليس مجرد 'ضعيف في الرياضيات')، تنبيه مبكر قبل تعثر الطالب، والتنبؤ بالنتائج قبل الامتحانات."
            />

            <div className="mt24">
              <CalloutBox color="dark">
                <div className="label-sm" style={{ color: '#5bc8ff' }}>المحرك — الذكاء الاصطناعي يعمل بصمت</div>
                <p style={{ marginBottom: 12 }}>
                  في المنصات التقليدية الذكاء الاصطناعي مجرد نافذة محادثة. في String يعمل عبر مجموعة وكلاء (Agents) تنجز المهام تلقائياً — كل نموذج يتولى ما يبرع فيه.
                </p>
                <div className="tags-row">
                  {['Aware — خوارزميتنا الخاصة', 'Gemini', 'GPT', 'Claude'].map(t => (
                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, marginLeft: 6, marginBottom: 6 }}>{t}</span>
                  ))}
                </div>
              </CalloutBox>
            </div>
          </div>
          <PageFooter page={3} total={8} />
        </Page>

        {/* ══════════════════════════════════════════════════
            PAGE 4 — ما يميز String
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="٠٣" label="ما يميز String" />
          <div className="page-body">
            <h2 className="section-heading">أربعة أسباب تضع String في الريادة</h2>
            <p className="section-lead">
              ليس تحديثاً لأنظمة قائمة — بل إعادة تصوّر جذرية لكيفية عمل المدرسة.
            </p>

            <FeatureRow
              icon="🔗"
              title="جميع أدواتكم في منصة واحدة"
              body="يجمع String مئات الأدوات التعليمية (Canva، Scratch…) بحساب دخول واحد. ومنصاتكم الحالية (بما فيها منصة تمرين) تتكامل بسلاسة — لا استغناء، بل توحيد."
            />
            <FeatureRow
              icon="📖"
              title="فهم عميق للمنهاج، وليس مجرد استضافة للمحتوى"
              body="يفهم String المنهاج نفسه حتى أصغر مفهوم، ويتكيف مع المناهج الوطنية الأردنية ومناهج كامبريدج الدولية."
            />
            <FeatureRow
              icon="🧠"
              title="ذكاء يمتد لكل تطبيق"
              body="يمنح String قدرات الذكاء الاصطناعي للتطبيقات التي تفتقر إليه. اطلب من المساعد إنشاء مسابقة حول تاريخ الأردن ليجهزها فوراً — حتى اجتماعات الفيديو تُلخَّص آلياً."
            />
            <FeatureRow
              icon="🎥"
              title="توثيق ذكي للحصص"
              body="يُسجل النظام الحصة كاملاً (الشاشة، السبورة، النقاشات)، يلخصها ويرصد تفاعل الطلاب — مع احتفاظ المعلم بالصلاحية الكاملة وفق معايير الخصوصية الصارمة."
            />

            <div className="mt24">
              <CalloutBox color="blue">
                <strong>ملاحظة:</strong> معظم المعلمين لا يحتاجون لأي مهارات تقنية. لوحة المعلم اليومية مصممة ببساطة متناهية، بينما تتم العمليات المعقدة في الخلفية تلقائياً.
              </CalloutBox>
            </div>
          </div>
          <PageFooter page={4} total={8} />
        </Page>

        {/* ══════════════════════════════════════════════════
            PAGE 5 — String DNA + خريطة المهارات
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="٠٤ · ٠٥" label="String DNA · خريطة المهارات" />
          <div className="page-body">

            <h2 className="section-heading">عقل كل طالب، مفهوماً بعمق</h2>
            <p className="body-text">
              String DNA ليس اختبار شخصية تقليدي، بل تحليل علمي لآلية عمل عقل الطالب. من خلال تجربة تفاعلية قصيرة، يكشف النظام كيف يفكر الطالب فعلياً عبر ثلاث طبقات:
            </p>

            <div className="dna-grid mb20">
              <div className="dna-card">
                <div className="dna-num">٠١ — كيف يفكر</div>
                <div className="dna-q">أسلوب المعالجة</div>
                <div className="dna-a">هل يستوعب الصورة الكبيرة أولاً أم يركز على التفاصيل؟</div>
              </div>
              <div className="dna-card">
                <div className="dna-num">٠٢ — لماذا يتعلم</div>
                <div className="dna-q">عقلية النمو</div>
                <div className="dna-a">هل يؤمن بأن الجهد يؤدي للنمو، أم يستسلم عند الخطأ الأول؟</div>
              </div>
              <div className="dna-card">
                <div className="dna-num">٠٣ — كيف يركز</div>
                <div className="dna-q">أسلوب التنظيم</div>
                <div className="dna-a">هل يميل للتخطيط المسبق أم يعتمد المحاولة والخطأ؟</div>
              </div>
            </div>

            <CalloutBox color="blue">
              تُنتج هذه المعايير <strong>128 ملفاً مختلفاً</strong> تُحدَّث باستمرار مع كل نشاط. النظام ينبه المعلم مبكراً إلى الطالب الموهوب الذي تنقصه الثقة، قبل أن يتعثر.
            </CalloutBox>

            <div style={{ marginTop: 28 }}>
              <div className="label-sm">خريطة المهارات — رصد الإتقان حتى أصغر مفهوم</div>
              <p className="body-text">
                يقسم النظام المنهاج إلى وحدات معرفية دقيقة ويتابع مستوى إتقان الطالب لكل منها. لا نكتفي بالدرجة النهائية:
              </p>

              <div className="skill-bars">
                {[
                  { label: 'قراءة الكسور', pct: 90, color: '#16a34a' },
                  { label: 'الجمع ثلاثي الأرقام', pct: 75, color: '#1e90d6' },
                  { label: 'جمع الكسور', pct: 25, color: '#e53e3e' },
                ].map(s => (
                  <div key={s.label} className="skill-bar-row">
                    <div className="skill-bar-top">
                      <span>{s.label}</span>
                      <span style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                    <div className="skill-bar-track">
                      <div className="skill-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 11, color: '#9ab0c8', lineHeight: 1.7, fontWeight: 500 }}>
                تُبنى هذه الخريطة تلقائياً أثناء تعلم الطالب دون الحاجة لامتحانات قياس إضافية.
                بحث علمي قيد الإعداد بالشراكة مع جامعة الحسين التقنية (HTU).
              </p>
            </div>
          </div>
          <PageFooter page={5} total={8} />
        </Page>

        {/* ══════════════════════════════════════════════════
            PAGE 6 — Quests + تطبيق الأهل
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="٠٦ · ٠٧" label="Quests · تطبيق الأهل" />
          <div className="page-body">

            <h2 className="section-heading">التعلم التفاعلي + الأهل في قلب العملية</h2>

            <TwoCol>
              <div>
                <div className="label-sm">Quests — التعلم التفاعلي الموجه</div>
                <p className="body-text">
                  يحول النظام منهجكم الرسمي إلى تجربة تفاعلية ممتعة مخصصة لمدرستكم — أشبه بـ Duolingo لكن بمحتوى مناهجكم تماماً.
                </p>
                <FeatureRow icon="⚡" title="محتوى جاهز" body="تُولد الأسئلة من المنهاج تلقائياً لتوفر وقت المعلم." />
                <FeatureRow icon="🔥" title="شغف التعلم" body="يُقبل الطلاب على الدراسة بدافع داخلي حتى في المنزل." />
                <FeatureRow icon="🎯" title="تخصيص كامل" body="تتكيف الأسئلة مع مستوى كل طالب بناءً على DNA وخريطة مهاراته." />
              </div>
              <div>
                <div className="label-sm">تطبيق الأهل — نافذة شفافة ومتابعة هادفة</div>
                <p className="body-text">
                  يضع تطبيق String الأهل في قلب العملية التعليمية يومياً.
                </p>
                <FeatureRow icon="📊" title="تفاصيل يوم الطالب" body="خريطة مهاراته ونصائح تربوية مخصصة يومياً." />
                <FeatureRow icon="🤖" title="المساعد الذكي Aware" body="يلخص تقدم الطالب ويقترح طرقاً لتقديم الدعم." />
                <FeatureRow icon="📋" title="نافذة شاملة" body="الواجبات، النماذج، طلبات الغياب، وتنسيق الاستلام." />
              </div>
            </TwoCol>

            <CalloutBox color="green">
              <strong>وقت شاشة هادف:</strong> يدرك String قلق الأهل من الأجهزة، لذا يحوّل انشغال الطلاب بها إلى أداة لرفع التحصيل. بدلاً من المتابعة المرهقة، يصل الأهل تقرير يومي يُثبت تقدم أبنائهم بشكل تفاعلي ومثمر.
            </CalloutBox>
          </div>
          <PageFooter page={6} total={8} />
        </Page>

        {/* ══════════════════════════════════════════════════
            PAGE 7 — التكامل
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="٠٨" label="التكامل من اليوم الأول" />
          <div className="page-body">
            <h2 className="section-heading">جاهز من اليوم الأول</h2>
            <p className="section-lead">
              أنتم لا تُعِدّون النظام؛ أنتم تقدمون بياناتكم فقط، وهو يتولى الباقي.
            </p>

            <FeatureRow
              icon="⚙️"
              title="تجهيز سريع — أقل من أسبوع"
              body="بمجرد ربط String بنظامكم الحالي (K12NET) أو تزويده بملفات البيانات، يقوم بسحب الجداول وتجهيز السجلات ليكون جاهزاً للعمل في أقل من أسبوع."
            />
            <FeatureRow
              icon="🔗"
              title="تكامل دون استغناء"
              body="ما ترغبون بالاحتفاظ به (المحاسبة وتتبع الحافلات في K12NET) يبقى كما هو ويتكامل String معه بسلاسة. القرار لكم بالكامل، دون فوضى أو انقطاع."
            />
            <FeatureRow
              icon="🤖"
              title="إدارة ذاتية مستمرة"
              body="يستمر النظام بإدارة العمل اليومي (أخذ الحضور، تصحيح المهام) في الخلفية لتتفرغوا للارتقاء بجودة التعليم."
            />

            <div className="mt24">
              <CalloutBox color="dark">
                <div className="label-sm" style={{ color: '#5bc8ff' }}>الخصوصية والأمان</div>
                <p>
                  كل ما يراه String يبقى ملكاً خاصاً لمدرستكم. <strong>لا نحتفظ بالبيانات</strong>، ولا نسمح لمزوّدي الذكاء الاصطناعي الخارجيين بالتدريب عليها أو تخزينها. رسائل مشفرة وصلاحيات دقيقة لكل مستخدم — السيطرة الكاملة بين أيديكم.
                </p>
              </CalloutBox>
            </div>
          </div>
          <PageFooter page={7} total={8} />
        </Page>

        {/* ══════════════════════════════════════════════════
            PAGE 8 — Contact
           ══════════════════════════════════════════════════ */}
        <Page>
          <PageHeader section="" label="للتواصل والاستفسار" />
          <div className="page-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>

            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#1e90d6', marginBottom: 16 }}>الخطوة التالية</div>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0c1a2e', marginBottom: 12 }}>
                جاهزون لجلسة عرض مخصصة<br />لمدارس المبادئ العلمية؟
              </h2>
              <p style={{ fontSize: 14, color: '#5a7a99', fontWeight: 500, lineHeight: 1.8 }}>
                تواصلوا مباشرة لترتيب جلسة عرض تفصيلية تشمل عرضاً حياً للنظام<br />وخطة تكامل مخصصة لبيئتكم التقنية.
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-left">
                <div className="contact-name">عمر أبو سليم</div>
                <div className="contact-role">المؤسس والرئيس التنفيذي · String Education</div>
                <div className="contact-detail">
                  <div className="contact-line">📧 omar@string.education</div>
                  <div className="contact-line" dir="ltr" style={{ textAlign: 'right' }}>📞 +962 78 671 7634</div>
                </div>
              </div>
              <div className="contact-right">S</div>
            </div>

            <div style={{ marginTop: 48, padding: '20px 0', borderTop: '1px solid #eaeef4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#b0bec8', fontWeight: 600 }}>© 2026 String Education. جميع الحقوق محفوظة.</span>
              <span className="confidential-badge">🔒 سري — للاطلاع المحدود فقط</span>
            </div>
          </div>
          <PageFooter page={8} total={8} />
        </Page>

      </div>
    </>
  );
}

export default MabadiProposal;
