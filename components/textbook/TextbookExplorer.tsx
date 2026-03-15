import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, HelpCircle, Layers, BarChart3, Brain,
  ChevronDown, ChevronRight, Check, X, Lightbulb,
  Shuffle, ArrowLeft, ArrowRight, Eye, EyeOff,
  Sparkles, Target, BookMarked, GraduationCap,
  ZoomIn, ZoomOut, RotateCcw, FileText, ChevronFirst, ChevronLast,
  Image, Type, AlertTriangle
} from 'lucide-react';
import {
  metadata, mapping, questionsByKC, flashcardsByKC,
  getKCList, getStats,
  type TextbookQuestion, type Flashcard, type KCFlashcards
} from '../../data/textbooks/textbookData';

// ─── Tab Types ─────────────────────────────────────────
type Tab = 'overview' | 'reader' | 'questions' | 'flashcards';

const TABS: { id: Tab; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
  { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: BarChart3 },
  { id: 'reader', labelAr: 'قراءة الكتب', labelEn: 'Book Reader', icon: BookOpen },
  { id: 'questions', labelAr: 'الأسئلة', labelEn: 'Questions', icon: HelpCircle },
  { id: 'flashcards', labelAr: 'البطاقات', labelEn: 'Flashcards', icon: Layers },
];

// ─── Color Helpers ─────────────────────────────────────
const DOMAIN_COLORS: Record<string, string> = {
  'Numbers & Operations': 'from-blue-500 to-cyan-400',
  'Patterns, Algebra & Functions': 'from-purple-500 to-pink-400',
  'Geometry & Measurement': 'from-emerald-500 to-teal-400',
  'Data Analysis & Probability': 'from-orange-500 to-amber-400',
};

const DOMAIN_BG: Record<string, string> = {
  'Numbers & Operations': 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  'Patterns, Algebra & Functions': 'bg-purple-500/10 border-purple-500/20 text-purple-300',
  'Geometry & Measurement': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  'Data Analysis & Probability': 'bg-orange-500/10 border-orange-500/20 text-orange-300',
};

const TYPE_LABELS: Record<string, { ar: string; color: string }> = {
  'multiple-choice': { ar: 'اختيار متعدد', color: 'bg-blue-500/20 text-blue-300' },
  'input': { ar: 'إدخال', color: 'bg-green-500/20 text-green-300' },
  'reorder': { ar: 'ترتيب', color: 'bg-purple-500/20 text-purple-300' },
  'matching': { ar: 'مطابقة', color: 'bg-amber-500/20 text-amber-300' },
};

// ─── Main Component ────────────────────────────────────
export const TextbookExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [readerBookId, setReaderBookId] = useState<string | null>(null);
  const stats = useMemo(() => getStats(), []);

  const openBook = useCallback((bookId: string) => {
    setReaderBookId(bookId);
    setActiveTab('reader');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{metadata.gradeLabel} - {metadata.subject}</h1>
            <p className="text-sm text-slate-400">{metadata.curriculum}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mt-4 bg-slate-800/50 rounded-xl p-1 w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.labelAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <OverviewTab stats={stats} onOpenBook={openBook} />
            </motion.div>
          )}
          {activeTab === 'reader' && (
            <motion.div key="reader" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <BookReaderTab initialBookId={readerBookId} />
            </motion.div>
          )}
          {activeTab === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <QuestionsTab />
            </motion.div>
          )}
          {activeTab === 'flashcards' && (
            <motion.div key="flashcards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FlashcardsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Overview Tab ──────────────────────────────────────
const OverviewTab: React.FC<{ stats: ReturnType<typeof getStats>; onOpenBook: (bookId: string) => void }> = ({ stats, onOpenBook }) => {
  const kcList = useMemo(() => getKCList(), []);
  const domainGroups = useMemo(() => {
    const groups: Record<string, typeof kcList> = {};
    for (const kc of kcList) {
      if (!groups[kc.domain]) groups[kc.domain] = [];
      groups[kc.domain].push(kc);
    }
    return groups;
  }, [kcList]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="الصفحات" value={stats.digitizedPages} icon={BookOpen} gradient="from-cyan-500 to-blue-500" />
        <StatCard label="المكونات المعرفية" value={stats.totalKCs} icon={Target} gradient="from-purple-500 to-pink-500" />
        <StatCard label="الأسئلة" value={stats.totalQuestions} icon={HelpCircle} gradient="from-green-500 to-emerald-500" />
        <StatCard label="البطاقات" value={stats.totalFlashcards} icon={Layers} gradient="from-amber-500 to-orange-500" />
        <StatCard label="الكتب" value={metadata.books.length} icon={BookMarked} gradient="from-rose-500 to-red-500" />
      </div>

      {/* Question Type Distribution */}
      <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          توزيع أنواع الأسئلة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.typeCounts).map(([type, count]) => {
            const info = TYPE_LABELS[type];
            const pct = Math.round((count / stats.totalQuestions) * 100);
            return (
              <div key={type} className="bg-slate-900/50 rounded-xl p-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${info?.color || 'bg-slate-600 text-slate-300'}`}>
                  {info?.ar || type}
                </span>
                <div className="text-2xl font-bold mt-2">{count}</div>
                <div className="text-xs text-slate-400">{pct}%</div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Books */}
      <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-cyan-400" />
          الكتب
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metadata.books.map(book => (
            <button
              key={book.id}
              onClick={() => onOpenBook(book.id)}
              className="bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 w-full text-right hover:bg-slate-800/60 hover:border-cyan-500/30 border border-transparent transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-lg font-bold text-cyan-400 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                {book.id.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{book.nameAr}</div>
                <div className="text-xs text-slate-400">{book.nameEn}</div>
                <div className="text-xs text-slate-500 mt-1">{book.pageCount} صفحة</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="text-xs">مرقمن</span>
                </div>
                <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">افتح الكتاب ←</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* KC by Domain */}
      <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
          المكونات المعرفية حسب المجال
        </h3>
        <div className="space-y-3">
          {Object.entries(domainGroups).map(([domain, kcs]) => (
            <DomainSection key={domain} domain={domain} kcs={kcs} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: React.ElementType; gradient: string }> = ({ label, value, icon: Icon, gradient }) => (
  <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-2`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    <div className="text-xs text-slate-400 mt-1">{label}</div>
  </div>
);

const DomainSection: React.FC<{ domain: string; kcs: ReturnType<typeof getKCList> }> = ({ domain, kcs }) => {
  const [open, setOpen] = useState(false);
  const totalQ = kcs.reduce((s, k) => s + k.questionCount, 0);
  const totalF = kcs.reduce((s, k) => s + k.flashcardCount, 0);
  const bg = DOMAIN_BG[domain] || 'bg-slate-500/10 border-slate-500/20 text-slate-300';

  return (
    <div className="bg-slate-900/30 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/30 transition-colors">
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <span className={`text-xs px-2 py-0.5 rounded-full border ${bg}`}>{domain}</span>
        <span className="text-sm font-medium flex-1 text-right">{kcs.length} KC</span>
        <span className="text-xs text-slate-500">{totalQ} سؤال</span>
        <span className="text-xs text-slate-500">{totalF} بطاقة</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1">
          {kcs.map(kc => (
            <div key={kc.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800/40">
              <span className="text-slate-500 font-mono w-16">{kc.id.replace('kc-math-g1-', '#')}</span>
              <span className="flex-1 text-slate-300">{kc.nameAr}</span>
              <span className="text-cyan-400">{kc.questionCount}q</span>
              <span className="text-amber-400">{kc.flashcardCount}f</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Simple Markdown Renderer ──────────────────────────
function parseMarkdownToElements(raw: string): React.ReactNode[] {
  // Strip YAML frontmatter (handle both \n and \r\n)
  const normalized = raw.replace(/\r\n/g, '\n');
  const fmMatch = normalized.match(/^---\n[\s\S]*?\n---\n/);
  const content = fmMatch ? normalized.slice(fmMatch[0].length) : normalized;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={key++} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {tableRows.map((cells, ri) => (
              <tr key={ri} className={ri === 0 ? 'bg-slate-700/30 font-bold' : 'border-t border-slate-700/30'}>
                {cells.map((c, ci) => (
                  <td key={ci} className="px-3 py-2 text-center">{c.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      if (inTable) flushTable();
      continue;
    }

    // SVG_TODO comments → render as placeholder cards (single-line)
    const svgMatch = line.match(/<!--\s*SVG_TODO:\s*(.*?)\s*-->/);
    if (svgMatch) {
      if (inTable) flushTable();
      elements.push(
        <div key={key++} className="my-3 p-3 bg-slate-800/50 border border-dashed border-slate-600/50 rounded-xl flex items-center gap-2 text-xs text-slate-500">
          <Image className="w-4 h-4 shrink-0 text-slate-600" />
          <span className="italic">{svgMatch[1]}</span>
        </div>
      );
      continue;
    }

    // Multi-line SVG_TODO comment start → gather lines until -->
    const svgStartMatch = line.match(/<!--\s*SVG_TODO:\s*(.*)/);
    if (svgStartMatch) {
      if (inTable) flushTable();
      let desc = svgStartMatch[1];
      while (i + 1 < lines.length && !lines[i + 1].includes('-->')) {
        i++;
        desc += ' ' + lines[i].trim();
      }
      if (i + 1 < lines.length) i++; // skip the closing --> line
      desc = desc.replace(/\s*-->\s*$/, '').trim();
      elements.push(
        <div key={key++} className="my-3 p-3 bg-slate-800/50 border border-dashed border-slate-600/50 rounded-xl flex items-start gap-2 text-xs text-slate-500">
          <Image className="w-4 h-4 shrink-0 text-slate-600 mt-0.5" />
          <span className="italic">{desc}</span>
        </div>
      );
      continue;
    }

    // Skip stray HTML comment closing tags
    if (line.trim() === '-->') continue;

    // Table rows
    if (line.trim().startsWith('|')) {
      // Skip separator rows (|---|---|)
      if (/^\|[\s\-|]+\|$/.test(line.trim())) continue;
      const cells = line.split('|').filter(Boolean);
      tableRows.push(cells);
      inTable = true;
      continue;
    }

    if (inTable) flushTable();

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-bold text-cyan-300 mt-4 mb-2">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-bold text-cyan-200 mt-5 mb-2 pb-1 border-b border-slate-700/40">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-xl font-bold text-white mt-4 mb-3">{renderInline(line.slice(2))}</h1>);
    }
    // List items
    else if (line.match(/^[-*]\s/)) {
      elements.push(
        <div key={key++} className="flex gap-2 my-1 pr-4 text-sm">
          <span className="text-cyan-500 mt-0.5">•</span>
          <span className="text-slate-200 leading-relaxed">{renderInline(line.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
    }
    // Regular paragraph
    else {
      elements.push(<p key={key++} className="text-sm text-slate-200 leading-relaxed my-2">{renderInline(line)}</p>);
    }
  }

  if (inTable) flushTable();
  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Book Reader Tab ──────────────────────────────────
const BookReaderTab: React.FC<{ initialBookId: string | null }> = ({ initialBookId }) => {
  const [selectedBook, setSelectedBook] = useState(initialBookId || metadata.books[0]?.id || 's1');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [viewMode, setViewMode] = useState<'image' | 'text' | 'split'>('image');
  const [mdContent, setMdContent] = useState<string | null>(null);
  const [mdLoading, setMdLoading] = useState(false);
  const [mdError, setMdError] = useState(false);

  const book = metadata.books.find(b => b.id === selectedBook) || metadata.books[0];
  const totalPages = book.pageCount;

  // Get page ID and KC info from mapping
  const pageId = `${book.imagePrefix}-page-${String(currentPage).padStart(3, '0')}`;
  const pageMapping = mapping.pages[pageId];
  const pageKCs = pageMapping?.kcIds?.map(kcId => ({
    id: kcId,
    name: mapping.kcs[kcId]?.nameAr || kcId,
    domain: mapping.kcs[kcId]?.domain || '',
  })) || [];
  const pageType = pageMapping?.pageType || 'content';

  const imageUrl = `/textbook-pages/${book.imagePrefix}-page-${String(currentPage).padStart(3, '0')}.png`;
  const mdUrl = `/textbook-md/${book.imagePrefix}-page-${String(currentPage).padStart(3, '0')}.md`;

  // Fetch markdown when page changes and viewMode includes text
  useEffect(() => {
    if (viewMode === 'image') return;
    let cancelled = false;
    setMdLoading(true);
    setMdError(false);
    fetch(mdUrl)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.text();
      })
      .then(text => { if (!cancelled) { setMdContent(text); setMdLoading(false); } })
      .catch(() => { if (!cancelled) { setMdContent(null); setMdError(true); setMdLoading(false); } });
    return () => { cancelled = true; };
  }, [mdUrl, viewMode]);

  const goToPage = (p: number) => {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val)) goToPage(val);
    }
  };

  const handleBookChange = (bookId: string) => {
    setSelectedBook(bookId);
    setCurrentPage(1);
    setPageInput('1');
    setZoom(1);
  };

  const PAGE_TYPE_LABELS: Record<string, string> = {
    cover: 'غلاف', copyright: 'حقوق', preface: 'مقدمة', toc: 'فهرس',
    'unit-intro': 'مقدمة وحدة', content: 'محتوى', exercise: 'تمارين',
  };

  return (
    <div className="space-y-4">
      {/* Book selector + controls */}
      <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Book tabs */}
          <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1">
            {metadata.books.map(b => (
              <button
                key={b.id}
                onClick={() => handleBookChange(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedBook === b.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="hidden sm:inline">{b.nameAr}</span>
                <span className="sm:hidden">{b.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex gap-0.5 bg-slate-900/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('image')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'image' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="عرض الصورة"
            >
              <Image className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">صورة</span>
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'text' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="عرض النص المستخرج"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نص</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'split' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="عرض مقسم"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مقسم</span>
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1 mr-auto">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
              <ChevronLast className="w-4 h-4" />
            </button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg px-2 py-1">
              <input
                type="text"
                value={pageInput}
                onChange={e => setPageInput(e.target.value)}
                onKeyDown={handlePageInput}
                onBlur={() => { const v = parseInt(pageInput); if (!isNaN(v)) goToPage(v); }}
                className="w-10 bg-transparent text-center text-sm font-bold outline-none"
              />
              <span className="text-xs text-slate-500">/ {totalPages}</span>
            </div>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
              <ChevronFirst className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls (only for image mode) */}
          {viewMode !== 'text' && (
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page viewer + info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main content area */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-3' : 'lg:col-span-3'} ${
          viewMode === 'split' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''
        }`}>
          {/* Image viewer (shown in 'image' and 'split' modes) */}
          {(viewMode === 'image' || viewMode === 'split') && (
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-auto max-h-[75vh] flex items-start justify-center p-4 bg-slate-950/50">
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={`صفحة ${currentPage}`}
                  className="rounded-lg shadow-2xl transition-transform duration-200"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).alt = 'الصفحة غير متاحة';
                  }}
                />
              </div>

              {/* Page scrubber (only on full image mode) */}
              {viewMode === 'image' && (
                <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
                  <input
                    type="range" min={1} max={totalPages} value={currentPage}
                    onChange={e => goToPage(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-500/30"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>1</span>
                    <span>{totalPages}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Markdown text viewer (shown in 'text' and 'split' modes) */}
          {(viewMode === 'text' || viewMode === 'split') && (
            <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-900/30 flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">النص المستخرج</span>
                <span className="text-[10px] text-slate-600 mr-auto">صفحة {currentPage}</span>
              </div>
              <div className="overflow-y-auto max-h-[70vh] p-5" dir="rtl">
                {mdLoading && (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin mr-2" />
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                )}
                {mdError && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <AlertTriangle className="w-8 h-8 text-amber-500/50 mb-2" />
                    <p className="text-sm">لا يوجد نص مستخرج لهذه الصفحة</p>
                  </div>
                )}
                {!mdLoading && !mdError && mdContent && (
                  <div className="prose-dark">
                    {parseMarkdownToElements(mdContent)}
                  </div>
                )}
              </div>

              {/* Page scrubber (text-only mode) */}
              {viewMode === 'text' && (
                <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
                  <input
                    type="range" min={1} max={totalPages} value={currentPage}
                    onChange={e => goToPage(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>1</span>
                    <span>{totalPages}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Page info */}
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              معلومات الصفحة
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">الكتاب</span>
                <span className="text-slate-300">{book.nameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الصفحة</span>
                <span className="text-slate-300">{currentPage} / {totalPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">نوع الصفحة</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pageType === 'content' || pageType === 'exercise' ? 'bg-cyan-500/20 text-cyan-300' :
                  pageType === 'unit-intro' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {PAGE_TYPE_LABELS[pageType] || pageType}
                </span>
              </div>
            </div>
          </div>

          {/* KCs on this page */}
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              المكونات المعرفية
            </h4>
            {pageKCs.length > 0 ? (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {pageKCs.map(kc => (
                  <div key={kc.id} className="bg-slate-900/50 rounded-lg p-2 text-xs">
                    <div className="text-slate-300 font-medium leading-relaxed">{kc.name}</div>
                    <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded ${DOMAIN_BG[kc.domain] || 'bg-slate-700'}`}>{kc.domain}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 text-center py-3">
                {pageType === 'cover' || pageType === 'copyright' || pageType === 'toc' || pageType === 'preface'
                  ? 'صفحة تمهيدية - لا توجد مكونات معرفية'
                  : 'لا توجد مكونات معرفية مرتبطة'}
              </p>
            )}
          </div>

          {/* Quick jump */}
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
            <h4 className="text-sm font-bold text-slate-300 mb-2">انتقال سريع</h4>
            <div className="grid grid-cols-5 gap-1 max-h-[200px] overflow-y-auto">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`text-[10px] py-1 rounded transition-colors ${
                    p === currentPage
                      ? 'bg-cyan-500 text-white font-bold'
                      : 'bg-slate-900/50 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Questions Tab ─────────────────────────────────────
const QuestionsTab: React.FC = () => {
  const kcList = useMemo(() => getKCList().filter(k => k.questionCount > 0), []);
  const [selectedKC, setSelectedKC] = useState<string | null>(null);
  const [filterDomain, setFilterDomain] = useState<string>('all');

  const domains = useMemo(() => [...new Set(kcList.map(k => k.domain))], [kcList]);
  const filtered = filterDomain === 'all' ? kcList : kcList.filter(k => k.domain === filterDomain);

  const selectedQuestions = selectedKC ? questionsByKC.get(selectedKC) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* KC List */}
      <div className="lg:col-span-1 bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="font-semibold mb-2">المكونات المعرفية</h3>
          <select
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="all">جميع المجالات</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="overflow-y-auto max-h-[600px] p-2 space-y-1">
          {filtered.map(kc => (
            <button
              key={kc.id}
              onClick={() => setSelectedKC(kc.id)}
              className={`w-full text-right p-2.5 rounded-xl text-sm transition-all ${
                selectedKC === kc.id
                  ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300'
                  : 'hover:bg-slate-700/30 text-slate-300'
              }`}
            >
              <div className="font-medium">{kc.nameAr}</div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>{kc.questionCount} سؤال</span>
                <span className={`px-1.5 py-0.5 rounded ${DOMAIN_BG[kc.domain] || ''}`}>{kc.standard}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Question Preview */}
      <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-4">
        {selectedQuestions ? (
          <>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{selectedQuestions.kcNameAr}</h3>
              <p className="text-sm text-slate-400">{selectedQuestions.domain} / {selectedQuestions.standard}</p>
              <p className="text-sm text-cyan-400 mt-1">{selectedQuestions.questions.length} سؤال</p>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[550px]">
              {selectedQuestions.questions.map((q, i) => (
                <QuestionCard key={q.id} question={q} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
            <HelpCircle className="w-12 h-12 mb-3 opacity-30" />
            <p>اختر مكوناً معرفياً لعرض الأسئلة</p>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{ question: TextbookQuestion; index: number }> = ({ question: q, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const typeInfo = TYPE_LABELS[q.type];
  const diffLabel = q.points === 10 ? 'سهل' : q.points === 15 ? 'متوسط' : 'صعب';
  const diffColor = q.points === 10 ? 'text-green-400' : q.points === 15 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-500 font-mono">#{index + 1}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo?.color || 'bg-slate-600'}`}>{typeInfo?.ar || q.type}</span>
        <span className={`text-xs ${diffColor}`}>{diffLabel}</span>
        <span className="text-xs text-slate-600 mr-auto">{q.points} نقطة</span>
      </div>
      <p className="text-sm font-medium mb-2" dir="rtl">{q.questionText}</p>

      {/* Options for multiple choice */}
      {q.type === 'multiple-choice' && q.options && (
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {q.options.map((opt, i) => (
            <div
              key={i}
              className={`text-xs px-3 py-1.5 rounded-lg border ${
                showAnswer && opt === q.correctAnswer
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/50 border-slate-700/30 text-slate-400'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {/* Pairs for matching */}
      {q.type === 'matching' && q.pairs && (
        <div className="space-y-1 mb-2">
          {q.pairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="bg-slate-800/50 px-2 py-1 rounded">{pair.left}</span>
              <span className="text-slate-600">↔</span>
              <span className={`px-2 py-1 rounded ${showAnswer ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800/50'}`}>
                {showAnswer ? pair.right : '???'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Answer toggle */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {showAnswer ? 'إخفاء الإجابة' : 'عرض الإجابة'}
        </button>
        {showAnswer && (
          <span className="text-xs text-emerald-400 font-medium">{q.correctAnswer}</span>
        )}
        <div className="mr-auto flex items-center gap-1 text-xs text-slate-600">
          <Lightbulb className="w-3 h-3" />
          {q.hint}
        </div>
      </div>
    </div>
  );
};

// ─── Flashcards Tab ────────────────────────────────────
const FlashcardsTab: React.FC = () => {
  const kcList = useMemo(() => getKCList().filter(k => k.flashcardCount > 0), []);
  const [selectedKC, setSelectedKC] = useState<string | null>(null);

  if (kcList.length === 0) {
    return (
      <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-12 flex flex-col items-center text-slate-500">
        <Layers className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-lg font-medium">البطاقات قيد الإنشاء</p>
        <p className="text-sm mt-1">سيتم إضافة البطاقات التعليمية قريباً</p>
      </div>
    );
  }

  const selectedFlashcards = selectedKC ? flashcardsByKC.get(selectedKC) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* KC List */}
      <div className="lg:col-span-1 bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="font-semibold">البطاقات التعليمية</h3>
          <p className="text-xs text-slate-400 mt-1">{kcList.length} مكون معرفي</p>
        </div>
        <div className="overflow-y-auto max-h-[600px] p-2 space-y-1">
          {kcList.map(kc => (
            <button
              key={kc.id}
              onClick={() => setSelectedKC(kc.id)}
              className={`w-full text-right p-2.5 rounded-xl text-sm transition-all ${
                selectedKC === kc.id
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                  : 'hover:bg-slate-700/30 text-slate-300'
              }`}
            >
              <div className="font-medium">{kc.nameAr}</div>
              <div className="text-xs text-slate-500 mt-1">{kc.flashcardCount} بطاقة</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flashcard Viewer */}
      <div className="lg:col-span-2">
        {selectedFlashcards ? (
          <FlashcardViewer flashcards={selectedFlashcards} />
        ) : (
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl border border-slate-700/50 p-12 flex flex-col items-center text-slate-500 h-[400px] justify-center">
            <Layers className="w-12 h-12 mb-3 opacity-30" />
            <p>اختر مكوناً معرفياً لعرض البطاقات</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FlashcardViewer: React.FC<{ flashcards: KCFlashcards }> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = flashcards.cards[currentIndex];

  const next = () => { setFlipped(false); setCurrentIndex(i => Math.min(i + 1, flashcards.cards.length - 1)); };
  const prev = () => { setFlipped(false); setCurrentIndex(i => Math.max(i - 1, 0)); };
  const shuffle = () => { setFlipped(false); setCurrentIndex(Math.floor(Math.random() * flashcards.cards.length)); };

  if (!card) return null;

  const diffLabel = card.difficulty === 1 ? 'سهل' : card.difficulty === 2 ? 'متوسط' : 'صعب';
  const diffColor = card.difficulty === 1 ? 'text-green-400' : card.difficulty === 2 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <h3 className="font-semibold text-white">{flashcards.kcNameAr}</h3>
        <span className="mr-auto">{currentIndex + 1} / {flashcards.cards.length}</span>
      </div>

      {/* Card */}
      <motion.div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[280px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-8 flex flex-col items-center justify-center relative overflow-hidden"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded">{card.type}</span>
          <span className={`text-xs ${diffColor}`}>{diffLabel}</span>
        </div>
        <div className="absolute top-3 right-3 text-xs text-slate-600">
          {flipped ? 'الإجابة' : 'السؤال'} - انقر للقلب
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? 'back' : 'front'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-xl font-medium leading-relaxed" dir="rtl">
              {flipped ? card.back : card.front}
            </p>
          </motion.div>
        </AnimatePresence>

        {!flipped && (
          <div className="absolute bottom-4 text-xs text-slate-600 flex items-center gap-1">
            <Eye className="w-3 h-3" /> انقر لرؤية الإجابة
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={prev} disabled={currentIndex === 0} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
        <button onClick={shuffle} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
          <Shuffle className="w-5 h-5" />
        </button>
        <button onClick={next} disabled={currentIndex === flashcards.cards.length - 1} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TextbookExplorer;
