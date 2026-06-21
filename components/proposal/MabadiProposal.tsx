import React from 'react';

/*
  Mabadi Proposal — Professional Document
  Looks like a real InDesign/Word document, not a React landing page.
  Rules:
  - Accent color (#2c4a3e) used ONLY on: cover sidebar, section header bands, section numbers, divider lines.
  - No emoji, no gradient cards, no colored callout boxes.
  - Body text is black on white. Always.
  - A4 pages stacked on a gray desk. Ctrl+P → clean PDF.
*/

const ACCENT = '#2c4a3e';
const ACCENT_MID = '#4a7c6a';

export function MabadiProposal() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

        @page { size: A4 portrait; margin: 0; }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #d4d4d4 !important; }

        .doc-root {
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          background: #d4d4d4;
          min-height: 100vh;
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        /* ── A4 sheet ─────────────────────────────────────── */
        .sheet {
          background: #fff;
          width: 794px;
          min-height: 1123px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          overflow: visible;
          position: relative;
        }

        /* ── Cover page ─────────────────────────────────────── */
        .cover {
          display: flex;
          flex-direction: row;
          min-height: 1123px;
        }
        .cover-left {
          width: 240px;
          flex-shrink: 0;
          background: ${ACCENT};
          display: flex;
          flex-direction: column;
          padding: 56px 32px 40px;
        }
        .cover-logo-mark {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .cover-brand {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 32px;
        }
        .cover-left-divider {
          width: 28px;
          height: 1.5px;
          background: rgba(255,255,255,0.35);
          margin-bottom: 24px;
        }
        .cover-left-tagline {
          font-size: 11px;
          font-weight: 500;
          line-height: 1.9;
          color: rgba(255,255,255,0.55);
        }
        .cover-left-bottom {
          margin-top: auto;
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 20px;
          font-size: 9.5px;
          color: rgba(255,255,255,0.3);
          line-height: 2;
          font-weight: 500;
        }
        .cover-right {
          flex: 1;
          padding: 56px 52px 44px;
          display: flex;
          flex-direction: column;
        }
        .cover-eyebrow {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${ACCENT_MID};
          margin-bottom: 18px;
        }
        .cover-title {
          font-size: 50px;
          font-weight: 900;
          color: #111;
          line-height: 1.2;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .cover-subtitle {
          font-size: 14px;
          color: #777;
          font-weight: 500;
          margin-bottom: 44px;
          padding-bottom: 44px;
          border-bottom: 1px solid #e8e8e8;
        }
        .cover-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px 32px;
          margin-bottom: 40px;
        }
        .cover-meta-label {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${ACCENT_MID};
          margin-bottom: 5px;
        }
        .cover-meta-value {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          line-height: 1.5;
        }
        .cover-meta-sub {
          font-size: 11px;
          color: #888;
          font-weight: 400;
          line-height: 1.6;
          margin-top: 2px;
        }
        .cover-toc-wrap {
          margin-top: auto;
          border-top: 1px solid #e8e8e8;
          padding-top: 24px;
        }
        .cover-toc-label {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 14px;
        }
        .cover-toc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px 28px;
        }
        .cover-toc-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: #555;
          font-weight: 500;
        }
        .cover-toc-num {
          font-size: 9px;
          font-weight: 800;
          color: ${ACCENT_MID};
          min-width: 20px;
        }
        .cover-conf {
          margin-top: 24px;
          font-size: 9.5px;
          color: #aaa;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* ── Page header band ─────────────────────────────────── */
        .page-band {
          background: ${ACCENT};
          padding: 13px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .band-title {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.3px;
        }
        .band-num {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.45);
          letter-spacing: 2px;
        }

        /* ── Page body ─────────────────────────────────────────── */
        .page-body {
          flex: 1;
          padding: 36px 48px 28px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Page footer ─────────────────────────────────────── */
        .page-foot {
          flex-shrink: 0;
          border-top: 1px solid #e8e8e8;
          padding: 10px 48px;
          display: flex;
          justify-content: space-between;
          font-size: 8.5px;
          color: #bbb;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* ── Typography ────────────────────────────────────────── */
        .doc-h2 {
          font-size: 24px;
          font-weight: 900;
          color: #111;
          line-height: 1.35;
          margin-bottom: 10px;
        }
        .doc-lead {
          font-size: 13px;
          color: #444;
          line-height: 1.95;
          font-weight: 400;
          margin-bottom: 22px;
        }
        .doc-p {
          font-size: 12.5px;
          color: #444;
          line-height: 1.9;
          font-weight: 400;
          margin-bottom: 14px;
        }
        .doc-p:last-child { margin-bottom: 0; }

        .doc-label {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${ACCENT_MID};
          margin-bottom: 10px;
          margin-top: 22px;
        }
        .doc-label:first-child { margin-top: 0; }

        /* ── Section divider ─────────────────────────────────── */
        .doc-rule {
          height: 1px;
          background: #e8e8e8;
          margin: 20px 0;
          border: none;
        }

        /* ── Pull quote ─────────────────────────────────────── */
        .pull-quote {
          border-right: 3px solid ${ACCENT};
          padding: 12px 16px;
          margin: 18px 0;
          background: #fafafa;
        }
        .pull-quote p {
          font-size: 13px;
          font-weight: 700;
          color: #222;
          line-height: 1.8;
          font-style: italic;
        }

        /* ── Two-column ──────────────────────────────────────── */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 36px;
        }

        /* ── Bullet list ─────────────────────────────────────── */
        .doc-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 18px;
        }
        .doc-list li {
          display: flex;
          gap: 10px;
          font-size: 12.5px;
          color: #444;
          line-height: 1.75;
          font-weight: 400;
        }
        .doc-list li::before {
          content: '—';
          color: ${ACCENT_MID};
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Numbered list ───────────────────────────────────── */
        .num-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 18px;
        }
        .num-list li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 12.5px;
          color: #444;
          line-height: 1.75;
          font-weight: 400;
        }
        .num-list li .n {
          font-size: 11px;
          font-weight: 800;
          color: ${ACCENT};
          min-width: 18px;
          margin-top: 2px;
        }

        /* ── Phase block ─────────────────────────────────────── */
        .phase {
          border: 1px solid #e0e8e4;
          border-top: 3px solid ${ACCENT};
          border-radius: 2px;
          padding: 14px 16px;
          margin-bottom: 12px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .phase-num {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${ACCENT_MID};
          margin-bottom: 5px;
        }
        .phase-title {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          margin-bottom: 5px;
        }
        .phase-body {
          font-size: 12px;
          color: #555;
          line-height: 1.75;
          font-weight: 400;
        }

        /* ── Simple table ────────────────────────────────────── */
        .doc-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 12px;
        }
        .doc-table th {
          background: ${ACCENT};
          color: #fff;
          font-weight: 700;
          font-size: 10.5px;
          padding: 8px 12px;
          text-align: right;
          letter-spacing: 0.5px;
        }
        .doc-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
          color: #444;
          font-weight: 400;
          line-height: 1.6;
        }
        .doc-table tr:last-child td { border-bottom: none; }
        .doc-table tr:nth-child(even) td { background: #fafafa; }
        .doc-table td.strong { font-weight: 700; color: #111; }
        .doc-table td.good { color: #2a7a4a; font-weight: 700; }
        .doc-table td.warn { color: #b85c00; font-weight: 700; }

        /* ── Info box ──────────────────────────────────────── */
        .info-box {
          border: 1px solid #dde8e4;
          border-radius: 3px;
          padding: 14px 18px;
          margin: 14px 0;
          background: #f7faf9;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .info-box-label {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${ACCENT_MID};
          margin-bottom: 7px;
        }
        .info-box p {
          font-size: 12px;
          color: #444;
          line-height: 1.8;
          font-weight: 400;
        }
        .info-box p strong { font-weight: 700; color: #222; }

        /* ── Contact card ────────────────────────────────────── */
        .contact-wrap {
          border: 1px solid #e0e8e4;
          border-top: 3px solid ${ACCENT};
          border-radius: 2px;
          padding: 28px 32px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 32px;
        }
        .contact-name {
          font-size: 17px;
          font-weight: 900;
          color: #111;
          margin-bottom: 3px;
        }
        .contact-role {
          font-size: 11.5px;
          color: #888;
          font-weight: 400;
          margin-bottom: 16px;
        }
        .contact-detail {
          font-size: 12.5px;
          color: #333;
          font-weight: 500;
          line-height: 2;
        }
        .contact-icon {
          width: 56px;
          height: 56px;
          background: ${ACCENT};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: -1px;
        }

        /* ── Print button ──────────────────────────────────── */
        .print-btn {
          position: fixed;
          bottom: 28px;
          left: 28px;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          background: ${ACCENT};
          color: #fff;
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          font-weight: 700;
          padding: 11px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(0,0,0,0.2);
          transition: background 0.2s;
          direction: rtl;
          letter-spacing: 0.3px;
        }
        .print-btn:hover { background: #1e3830; }

        /* ── Print media ─────────────────────────────────────── */
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body, .doc-root { background: #fff !important; padding: 0 !important; gap: 0 !important; }
          .sheet {
            width: 210mm !important;
            min-height: 297mm !important;
            box-shadow: none !important;
            overflow: visible !important;
            page-break-after: always;
            break-after: page;
          }
          .sheet:last-child { break-after: avoid; page-break-after: avoid; }
          .print-btn { display: none !important; }
          .phase, .info-box, .pull-quote { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      <div className="doc-root">

        <button
          className="print-btn"
          onClick={() => typeof window !== 'undefined' && window.print()}
          aria-label="طباعة / حفظ PDF"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <span>طباعة · PDF</span>
        </button>

        {/* COVER */}
        <div className="sheet cover">
          <div className="cover-left">
            <div className="cover-logo-mark">S</div>
            <div className="cover-brand">String</div>
            <div className="cover-left-divider" />
            <div className="cover-left-tagline">
              نظام تشغيل<br />للتعليم
            </div>
            <div className="cover-left-bottom">
              <div>يونيو ٢٠٢٦</div>
              <div>String Education</div>
              <div style={{ marginTop: 8 }}>string.education</div>
            </div>
          </div>

          <div className="cover-right">
            <div className="cover-eyebrow">نظرة عامة شاملة</div>
            <div className="cover-title">نظام تشغيل<br/>للتعليم</div>
            <div className="cover-subtitle">تعليمٌ يدرك تفرّد كل طالب</div>

            <div className="cover-meta-grid">
              <div>
                <div className="cover-meta-label">مُعَد لـ</div>
                <div className="cover-meta-value">مدارس المبادئ العلمية</div>
                <div className="cover-meta-sub">عناية المدير العام<br/>المهندس محمد الملازم</div>
              </div>
              <div>
                <div className="cover-meta-label">بالتنسيق مع</div>
                <div className="cover-meta-value">المهندسة سلام اليوسف</div>
              </div>
              <div>
                <div className="cover-meta-label">مُعَد من</div>
                <div className="cover-meta-value">فريق String</div>
                <div className="cover-meta-sub">عمر أبو سليم<br/>المؤسس والرئيس التنفيذي</div>
              </div>
              <div>
                <div className="cover-meta-label">التاريخ</div>
                <div className="cover-meta-value">يونيو ٢٠٢٦</div>
              </div>
            </div>

            <div className="cover-toc-wrap">
              <div className="cover-toc-label">محتويات الوثيقة</div>
              <div className="cover-toc-grid">
                {[
                  ['٠١', 'الفكرة والرؤية'],
                  ['٠٢', 'الذكاء الاصطناعي'],
                  ['٠٣', 'ما يميز String'],
                  ['٠٤', 'String DNA'],
                  ['٠٥', 'خريطة المهارات'],
                  ['٠٦', 'Quests'],
                  ['٠٧', 'تطبيق الأهل'],
                  ['٠٨', 'التكامل والأمان'],
                ].map(([n, l]) => (
                  <div key={n} className="cover-toc-row">
                    <span className="cover-toc-num">{n}</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cover-conf">سري وخاص — للاطلاع المحدود فقط</div>
          </div>
        </div>

        {/* PAGE 2 — الفكرة والرؤية */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">الفكرة والرؤية</span>
            <span className="band-num">٠١</span>
          </div>
          <div className="page-body">
            <div className="doc-h2">فئة جديدة بالكامل في عالم التعليم</div>
            <p className="doc-lead">
              تعاني المدارس اليوم من تشتت الأدوات: نظام للدرجات، وآخر للحضور، وثالث للتواصل مع الأهل. هذه الأنظمة المنعزلة لا تتخاطب مع بعضها، مما يترك عبء نقل المعلومات يدوياً على عاتق المعلم طوال اليوم.
            </p>

            <div className="two-col">
              <div>
                <div className="doc-label">المشكلة</div>
                <p className="doc-p">
                  المدرسة تشتري أنظمة لا تتحدث مع بعضها. نظام الدرجات لا يعرف بيانات الحضور، ومنصة المحتوى لا تعرف نتائج الطلاب. المعلم هو الجسر الوحيد بينها — يقضي ساعات في نقل البيانات يدوياً بدلاً من التدريس.
                </p>
              </div>
              <div>
                <div className="doc-label">الحل</div>
                <p className="doc-p">
                  فكما يجمع نظام iOS كل تطبيقاتك لتتشارك البيانات بسلاسة، يعمل String كنظام تشغيل شامل للمدرسة. داخله، تعمل كل أدواتكم بتناغم تام، ويرى النظام الصورة الأكاديمية الكاملة لأول مرة.
                </p>
              </div>
            </div>

            <hr className="doc-rule" />

            <div className="pull-quote">
              <p>"لن يتمكن أي نظام من مساعدة طالب لا يرى تفاصيل رحلته. String يرى الصورة الكاملة."</p>
            </div>

            <hr className="doc-rule" />

            <div className="two-col">
              <div>
                <div className="doc-label">ليس نظام إدارة تعلم آخر</div>
                <p className="doc-p">
                  أنظمة LMS التقليدية تستضيف المحتوى فقط. String يفهم المنهاج نفسه، ويتتبع تقدم كل طالب في كل مفهوم، ويربط هذا الفهم بكل أداة تعليمية داخله.
                </p>
              </div>
              <div>
                <div className="doc-label">البنية التحتية الجديدة</div>
                <p className="doc-p">
                  String ليس أداة إضافية تثقل كاهل المعلم، بل هو البنية التحتية التي توحد جميع أدواتكم — نظام متكامل يمنحكم الرؤية الشاملة لكل ما يحدث داخل الغرفة الصفية.
                </p>
              </div>
            </div>
          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>2 / 8</span>
          </div>
        </div>

        {/* PAGE 3 — الذكاء الاصطناعي */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">توظيف الذكاء الاصطناعي</span>
            <span className="band-num">٠٢</span>
          </div>
          <div className="page-body">
            <div className="doc-h2">كيف نوظّف الذكاء الاصطناعي لإحداث تأثير حقيقي؟</div>
            <p className="doc-lead">
              أحدث الذكاء الاصطناعي ثورة في كل القطاعات باستثناء التعليم. السبب جوهري: التعليم يتوزع بين الغرفة الصفية والمنصات والواجبات. الذكاء الاصطناعي يفتقر للقدرة على تحليل بيانات مبعثرة لا يراها. لذلك صُمّم String ليتجاوز ثلاث حقائق جوهرية:
            </p>

            <ul className="num-list">
              <li><span className="n">١.</span><span>لا يمكن أتمتة مهام لا يراها النظام بوضوح.</span></li>
              <li><span className="n">٢.</span><span>لا يمكن تخصيص تجربة التعلم دون فهم دقيق وعميق للطالب.</span></li>
              <li><span className="n">٣.</span><span>لا يُبنى ذكاء حقيقي استناداً إلى بيانات مشتتة.</span></li>
            </ul>

            <hr className="doc-rule" />
            <div className="doc-label">عندما تتكامل المنظومة: ثلاث قدرات محورية</div>

            <div className="phase">
              <div className="phase-num">القدرة الأولى</div>
              <div className="phase-title">أتمتة تُعيد للمعلم وقته وشغفه</div>
              <div className="phase-body">رصد الحضور بثوانٍ، إدخال الدرجات آلياً، وكتابة التقارير تلقائياً. كل دقيقة كانت تُهدر في الإدارة، تعود الآن للتدريس.</div>
            </div>

            <div className="phase">
              <div className="phase-num">القدرة الثانية</div>
              <div className="phase-title">تجربة تعليمية تُصمم على مقاس كل طالب</div>
              <div className="phase-body">يبني String ملفاً معرفياً لكل طالب يحدد آلية تفكيره وعمله ضمن 128 نمطاً مختلفاً. تتكيف صعوبة الأسئلة وأسلوب الشرح مع مستوى إتقان الطالب لكل مفهوم.</div>
            </div>

            <div className="phase">
              <div className="phase-num">القدرة الثالثة</div>
              <div className="phase-title">ذكاء يقرأ ما وراء الأرقام</div>
              <div className="phase-body">تحليل دقيق لتحديد الفجوات المعرفية — لا مجرد "ضعيف في الرياضيات"، بل تحديد المفهوم بدقة. تنبيه مبكر قبل تعثر الطالب، والتنبؤ بنتائجه قبل الامتحانات.</div>
            </div>

            <div className="info-box">
              <div className="info-box-label">المحرك — الذكاء الاصطناعي يعمل بصمت</div>
              <p>
                في المنصات التقليدية الذكاء الاصطناعي مجرد نافذة محادثة. في String يعمل عبر مجموعة وكلاء (Agents) تنجز المهام تلقائياً، باستخدام خوارزميتنا الخاصة (Aware) مدمجةً مع أقوى النماذج العالمية — <strong>Gemini · GPT · Claude</strong>. كل نموذج يتولى ما يبرع فيه: سرعة التصحيح، عمق التحليل، وضوح الصياغة.
              </p>
            </div>
          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>3 / 8</span>
          </div>
        </div>

        {/* PAGE 4 — ما يميز String */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">ما يميز String</span>
            <span className="band-num">٠٣</span>
          </div>
          <div className="page-body">
            <div className="doc-h2">أربعة أسباب تضع String في الريادة</div>
            <p className="doc-lead">
              ليس تحديثاً لأنظمة قائمة — بل إعادة تصوّر جذرية لكيفية عمل المدرسة. هذه الأسباب الأربعة هي ما يجعل String فئة مستقلة، وليس مجرد أداة إضافية.
            </p>

            <div className="phase">
              <div className="phase-num">الميزة الأولى</div>
              <div className="phase-title">جميع أدواتكم في منصة واحدة</div>
              <div className="phase-body">
                يجمع String مئات الأدوات التعليمية — Canva، Scratch، وغيرها — بحساب دخول واحد. ومنصاتكم الحالية، بما فيها منصة تمرين وغيرها، لا تُستبدل؛ بل تتكامل بسلاسة داخل String لتبادل البيانات. القرار لكم بالكامل.
              </div>
            </div>

            <div className="phase">
              <div className="phase-num">الميزة الثانية</div>
              <div className="phase-title">فهم عميق للمنهاج، لا مجرد استضافة للمحتوى</div>
              <div className="phase-body">
                خلافاً للأنظمة التي تكتفي برفع الملفات، يفهم String المنهاج نفسه حتى أصغر مفهوم. يتكيف بمرونة تامة مع المناهج المعتمدة لديكم — سواء كان المنهاج الوطني الأردني أو مناهج كامبريدج الدولية.
              </div>
            </div>

            <div className="phase">
              <div className="phase-num">الميزة الثالثة</div>
              <div className="phase-title">ذكاء يمتد لكل تطبيق</div>
              <div className="phase-body">
                يمنح String قدرات الذكاء الاصطناعي للتطبيقات التي تفتقر إليه. اطلب من المساعد إنشاء مسابقة حول تاريخ الأردن ليجهزها فوراً. حتى اجتماعات الفيديو تُسجَّل وتُلخَّص وتُحلَّل آلياً.
              </div>
            </div>

            <div className="phase">
              <div className="phase-num">الميزة الرابعة</div>
              <div className="phase-title">توثيق ذكي للحصص</div>
              <div className="phase-body">
                يُسجل النظام الحصة كاملاً — الشاشة والسبورة والنقاشات — ثم يلخصها ويرصد تفاعل الطلاب، مع احتفاظ المعلم بالصلاحية الكاملة للمشاركة وفق معايير الخصوصية الصارمة.
              </div>
            </div>

            <div className="info-box" style={{ marginTop: 8 }}>
              <div className="info-box-label">ملاحظة للمعلمين</div>
              <p>
                معظم المعلمين لا يحتاجون لأي مهارات تقنية. لوحة المعلم اليومية مصممة ببساطة متناهية، بينما تتم العمليات المعقدة في الخلفية تلقائياً. واجهة <strong>Studio</strong> هي مساحة إبداعية اختيارية للمعلمين الأكثر ابتكاراً فقط.
              </p>
            </div>
          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>4 / 8</span>
          </div>
        </div>

        {/* PAGE 5 — DNA + خريطة المهارات */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">String DNA · خريطة المهارات</span>
            <span className="band-num">٠٤ · ٠٥</span>
          </div>
          <div className="page-body">
            <div className="doc-h2">عقل كل طالب، مفهوماً بعمق</div>
            <p className="doc-p">
              String DNA ليس اختبار شخصية تقليدي، بل تحليل علمي دقيق لآلية عمل عقل الطالب. من خلال تجربة تفاعلية قصيرة، يكشف النظام كيف يفكر الطالب فعلياً عبر ثلاث طبقات: كيف يفكر، لماذا يتعلم، وكيف يركز.
            </p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>الطبقة</th>
                  <th>السؤال الجوهري</th>
                  <th>ما يكشفه النظام</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="strong">كيف يفكر</td>
                  <td>أسلوب المعالجة</td>
                  <td>هل يستوعب الصورة الكبيرة أولاً أم يركز على التفاصيل؟</td>
                </tr>
                <tr>
                  <td className="strong">لماذا يتعلم</td>
                  <td>عقلية النمو</td>
                  <td>هل يؤمن بأن الجهد يؤدي للنمو، أم يستسلم عند الخطأ الأول؟</td>
                </tr>
                <tr>
                  <td className="strong">كيف يركز</td>
                  <td>أسلوب التنظيم</td>
                  <td>هل يميل للتخطيط المسبق أم يعتمد المحاولة والخطأ؟</td>
                </tr>
              </tbody>
            </table>

            <p className="doc-p">
              تُنتج هذه المعايير <strong>128 ملفاً معرفياً مختلفاً</strong> تُحدَّث باستمرار مع كل نشاط. لا يكتفي النظام بوصف الطالب، بل ينبه المعلم مبكراً إلى الطالب الموهوب الذي تنقصه الثقة — قبل أن يتعثر.
            </p>

            <hr className="doc-rule" />

            <div className="doc-h2" style={{ fontSize: 20 }}>خريطة المهارات — رصد الإتقان حتى أصغر مفهوم</div>
            <p className="doc-p">
              يقسم النظام المنهاج إلى وحدات معرفية دقيقة ويتابع مستوى إتقان الطالب لكل منها. لا نكتفي بالدرجة النهائية:
            </p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>المفهوم</th>
                  <th>مستوى الإتقان</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>قراءة الكسور</td>
                  <td>90%</td>
                  <td className="good">ممتاز</td>
                </tr>
                <tr>
                  <td>الجمع ثلاثي الأرقام</td>
                  <td>75%</td>
                  <td className="good">جيد</td>
                </tr>
                <tr>
                  <td>جمع الكسور</td>
                  <td>25%</td>
                  <td className="warn">يحتاج دعم</td>
                </tr>
              </tbody>
            </table>

            <p className="doc-p" style={{ fontSize: 11, color: '#888' }}>
              تُبنى هذه الخريطة تلقائياً أثناء تعلم الطالب واستخدامه للمنصة، دون الحاجة لامتحانات قياس إضافية.
              بحث علمي قيد الإعداد بالشراكة مع جامعة الحسين التقنية (HTU).
            </p>
          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>5 / 8</span>
          </div>
        </div>

        {/* PAGE 6 — Quests + تطبيق الأهل */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">Quests · تطبيق الأهل</span>
            <span className="band-num">٠٦ · ٠٧</span>
          </div>
          <div className="page-body">
            <div className="two-col">
              <div>
                <div className="doc-h2" style={{ fontSize: 20 }}>Quests</div>
                <div className="doc-label">التعلم التفاعلي الموجَّه</div>
                <p className="doc-p">
                  يحول النظام منهجكم الرسمي إلى تجربة تفاعلية ممتعة مخصصة لمدرستكم — أشبه بـ Duolingo لكن بمحتوى مناهجكم تماماً.
                </p>
                <ul className="doc-list">
                  <li><strong>محتوى جاهز:</strong> تُولد الأسئلة من المنهاج تلقائياً لتوفر وقت المعلم.</li>
                  <li><strong>شغف التعلم:</strong> بفضل التحديات، يُقبل الطلاب على الدراسة بدافع داخلي حتى في المنزل.</li>
                  <li><strong>تخصيص كامل:</strong> تتكيف الأسئلة مع مستوى كل طالب بناءً على DNA وخريطة مهاراته.</li>
                  <li><strong>التركيز على الفهم</strong> بدلاً من الحفظ — أسئلة تقيس التطبيق والتفكير.</li>
                </ul>
              </div>
              <div>
                <div className="doc-h2" style={{ fontSize: 20 }}>تطبيق الأهل</div>
                <div className="doc-label">نافذة شفافة ومتابعة هادفة</div>
                <p className="doc-p">
                  يضع تطبيق String الأهل في قلب العملية التعليمية يومياً.
                </p>
                <ul className="doc-list">
                  <li>تفاصيل يوم الطالب وخريطة مهاراته ونصائح تربوية مخصصة.</li>
                  <li>المساعد الذكي Aware يلخص التقدم ويقترح طرق الدعم.</li>
                  <li>نافذة شاملة للواجبات، النماذج، وطلبات الغياب.</li>
                  <li>وقت شاشة هادف: بدلاً من المتابعة المرهقة، تقرير يومي يُثبت التقدم بشكل تفاعلي.</li>
                </ul>
              </div>
            </div>

            <hr className="doc-rule" />

            <div className="info-box">
              <div className="info-box-label">وقت الشاشة — موقف String</div>
              <p>
                يدرك String قلق الأهل من انشغال الأبناء بالأجهزة، لذا يحوّل هذا الانشغال إلى أداة لرفع التحصيل. بدلاً من المتابعة المرهقة، يصل الأهل تقرير يومي يُثبت تقدم أبنائهم وإتقانهم للمفاهيم بشكل تفاعلي ومثمر.
              </p>
            </div>
          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>6 / 8</span>
          </div>
        </div>

        {/* PAGE 7 — التكامل والأمان */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">التكامل والأمان</span>
            <span className="band-num">٠٨</span>
          </div>
          <div className="page-body">
            <div className="doc-h2">جاهز من اليوم الأول</div>
            <p className="doc-lead">
              أنتم لا تُعِدّون النظام؛ أنتم تقدمون بياناتكم فقط، وهو يتولى الباقي.
            </p>

            <div className="phase">
              <div className="phase-num">المرحلة الأولى</div>
              <div className="phase-title">تجهيز سريع — أقل من أسبوع</div>
              <div className="phase-body">
                بمجرد ربط String بنظامكم الحالي (K12NET) أو تزويده بملفات البيانات، يقوم بسحب الجداول وتجهيز السجلات ليكون جاهزاً للعمل في أقل من أسبوع.
              </div>
            </div>

            <div className="phase">
              <div className="phase-num">المرحلة الثانية</div>
              <div className="phase-title">تكامل دون استغناء</div>
              <div className="phase-body">
                لا حاجة للتخلي عن أنظمتكم الإدارية الحالية. ما ترغبون بالاحتفاظ به — كالمحاسبة وتتبع الحافلات في K12NET — يبقى كما هو، ويتكامل String معه بسلاسة لتبادل البيانات. القرار لكم بالكامل، دون فوضى أو انقطاع.
              </div>
            </div>

            <div className="phase">
              <div className="phase-num">المرحلة الثالثة</div>
              <div className="phase-title">إدارة ذاتية مستمرة</div>
              <div className="phase-body">
                يستمر النظام بإدارة العمل اليومي — أخذ الحضور، تصحيح المهام — في الخلفية، لتتفرغوا أنتم للارتقاء بجودة التعليم.
              </div>
            </div>

            <hr className="doc-rule" />
            <div className="doc-label">الخصوصية والأمان</div>

            <div className="two-col">
              <div>
                <p className="doc-p">
                  كل ما يراه String يبقى ملكاً خاصاً لمدرستكم. لا نحتفظ بالبيانات، ولا نسمح لمزوّدي الذكاء الاصطناعي الخارجيين بالتدريب عليها أو تخزينها.
                </p>
              </div>
              <div>
                <p className="doc-p">
                  رسائل مشفرة وصلاحيات دقيقة لكل مستخدم. السيطرة الكاملة بين أيديكم — نضمن لكم بيئة آمنة في كل الأوقات.
                </p>
              </div>
            </div>
          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>7 / 8</span>
          </div>
        </div>

        {/* PAGE 8 — التواصل */}
        <div className="sheet">
          <div className="page-band">
            <span className="band-title">للتواصل والاستفسار</span>
            <span className="band-num" />
          </div>
          <div className="page-body" style={{ justifyContent: 'center' }}>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' as const, color: ACCENT_MID, marginBottom: 14 }}>الخطوة التالية</div>
              <div className="doc-h2" style={{ fontSize: 28, textAlign: 'center' }}>
                جاهزون لجلسة عرض مخصصة<br />لمدارس المبادئ العلمية؟
              </div>
              <p className="doc-p" style={{ textAlign: 'center', marginTop: 12 }}>
                تواصلوا مباشرة لترتيب جلسة عرض تفصيلية تشمل عرضاً حياً للنظام وخطة تكامل مخصصة لبيئتكم التقنية.
              </p>
            </div>

            <div className="contact-wrap">
              <div>
                <div className="contact-name">عمر أبو سليم</div>
                <div className="contact-role">المؤسس والرئيس التنفيذي · String Education</div>
                <div className="contact-detail">
                  <div>omar@string.education</div>
                  <div dir="ltr" style={{ textAlign: 'right' }}>+962 78 671 7634</div>
                </div>
              </div>
              <div className="contact-icon">S</div>
            </div>

            <div style={{ marginTop: 40, borderTop: '1px solid #e8e8e8', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#bbb', fontWeight: 500 }}>© 2026 String Education. جميع الحقوق محفوظة.</span>
              <span style={{ fontSize: 9.5, color: '#aaa', fontWeight: 500 }}>سري — للاطلاع المحدود فقط</span>
            </div>

          </div>
          <div className="page-foot">
            <span>String · مدارس المبادئ العلمية · يونيو ٢٠٢٦</span>
            <span>سري — للاطلاع المحدود فقط</span>
            <span>8 / 8</span>
          </div>
        </div>

      </div>
    </>
  );
}

export default MabadiProposal;
