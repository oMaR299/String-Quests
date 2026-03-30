import React from 'react';
import { Download } from 'lucide-react';
import type { FormDefinition, FormResponse } from '../../../types/notification';

// --- CSV generation helpers ---

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAnswer(answer: string | string[] | number | boolean | undefined): string {
  if (answer === undefined || answer === null) return '';
  if (typeof answer === 'boolean') return answer ? 'نعم' : 'لا';
  if (typeof answer === 'number') return answer.toString();
  if (Array.isArray(answer)) return answer.join(' ، ');
  return String(answer);
}

function generateCsv(form: FormDefinition, responses: FormResponse[]): string {
  // BOM for Arabic text support in Excel
  const BOM = '\ufeff';

  // Header row
  const headerCols = [
    'الاسم',
    'الدور',
    'الصف',
    'الشعبة',
    'تاريخ الإرسال',
    ...form.fields.map((f) => f.label),
  ];

  const headerRow = headerCols.map(escapeCsvValue).join(',');

  // Role labels
  const roleLabels: Record<string, string> = {
    student: 'طالب',
    teacher: 'معلم',
    parent: 'ولي أمر',
    admin: 'مسؤول',
  };

  // Data rows
  const dataRows = responses.map((response) => {
    const cols = [
      response.respondentName,
      roleLabels[response.respondentRole] || response.respondentRole,
      response.respondentGrade?.toString() || '',
      response.respondentSection || '',
      new Date(response.submittedAt).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...form.fields.map((field) => formatAnswer(response.answers[field.id])),
    ];
    return cols.map(escapeCsvValue).join(',');
  });

  return BOM + [headerRow, ...dataRows].join('\n');
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Component ---

interface FormExporterProps {
  form: FormDefinition;
  responses: FormResponse[];
  onExport: () => void;
}

export const FormExporter: React.FC<FormExporterProps> = ({
  form,
  responses,
  onExport,
}) => {
  const handleExport = () => {
    const csv = generateCsv(form, responses);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${form.title.replace(/\s+/g, '_')}_${timestamp}.csv`;
    triggerDownload(csv, filename);
    onExport();
  };

  return (
    <button
      onClick={handleExport}
      disabled={responses.length === 0}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        responses.length > 0
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:shadow-sm'
          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
      }`}
    >
      <Download className="w-4 h-4" />
      <span>تصدير إلى Excel</span>
    </button>
  );
};
