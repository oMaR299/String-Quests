import React, { useMemo } from 'react';

interface EmailPreviewRendererProps {
  title: string;
  body: string;
  ctaButton?: { label: string; url: string };
}

export const EmailPreviewRenderer: React.FC<EmailPreviewRendererProps> = ({
  title,
  body,
  ctaButton,
}) => {
  const srcdoc = useMemo(() => {
    const escapedTitle = escapeHtml(title || 'عنوان الإشعار');
    const escapedBody = escapeHtml(body || 'محتوى الرسالة سيظهر هنا...')
      .replace(/\n/g, '<br/>');

    const ctaHtml = ctaButton?.label
      ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${escapeHtml(ctaButton.url || '#')}" style="
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9, #2563eb);
            color: white;
            padding: 12px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            font-family: 'Cairo', sans-serif;
          ">${escapeHtml(ctaButton.label)}</a>
        </div>
      `
      : '';

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Cairo', sans-serif;
      background: #f1f5f9;
      padding: 16px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 20px 24px; text-align: center;">
      <div style="font-size: 18px; font-weight: 800; color: white; letter-spacing: 0.5px;">
        مدارس الخضر الحديثة
      </div>
      <div style="font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.7); margin-top: 4px; letter-spacing: 2px;">
        STRING EDUCATION
      </div>
    </div>

    <!-- Subject -->
    <div style="padding: 20px 24px 0; border-bottom: 1px solid #f1f5f9;">
      <h1 style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 16px; line-height: 1.6;">
        ${escapedTitle}
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 20px 24px; font-size: 13px; line-height: 1.8; color: #475569; font-weight: 600;">
      ${escapedBody}
    </div>

    <!-- CTA -->
    ${ctaHtml}

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 11px; color: #94a3b8; font-weight: 600;">
        مدارس الخضر الحديثة &copy; ${new Date().getFullYear()}
      </p>
      <p style="font-size: 10px; color: #cbd5e1; margin-top: 4px; font-weight: 600;">
        هذا البريد أُرسل تلقائيًا عبر نظام String
      </p>
    </div>
  </div>
</body>
</html>`;
  }, [title, body, ctaButton]);

  return (
    <iframe
      srcDoc={srcdoc}
      title="معاينة البريد الإلكتروني"
      className="w-full h-[400px] rounded-xl border border-slate-200 bg-white"
      sandbox="allow-same-origin"
      style={{ overflow: 'auto' }}
    />
  );
};

function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c] || c);
}
