import React, { useState, useEffect, useRef } from 'react';
import { EdisonProposalPart1 } from './EdisonProposalPart1';
import { EdisonProposalPart2 } from './EdisonProposalPart2';
import { EdisonProposalPart1En } from './EdisonProposalPart1En';
import { EdisonProposalPart2En } from './EdisonProposalPart2En';

export const EdisonProposal: React.FC = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const containerRef = useRef<HTMLDivElement>(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = 1;
      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 200) {
          current = Number(el.getAttribute('data-section')) || current;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (n: number) => {
    const el = document.querySelector(`[data-section="${n}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white font-['Cairo']" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Sticky Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/string-logo.png" alt="String" className="h-8 w-auto" />
            <span className="text-sm font-black text-slate-900">
              {isAr ? 'عرض أسعار' : 'Pricing Proposal'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLocale(isAr ? 'en' : 'ar')}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            >
              <span className="text-base leading-none">{isAr ? '🇬🇧' : '🇸🇦'}</span>
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
            {/* Section dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSection(i + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeSection === i + 1
                      ? 'bg-sky-500 scale-125'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={isAr ? `القسم ${i + 1}` : `Section ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-14">
        {isAr ? (
          <>
            <EdisonProposalPart1 />
            <EdisonProposalPart2 />
          </>
        ) : (
          <>
            <EdisonProposalPart1En />
            <EdisonProposalPart2En />
          </>
        )}
      </div>
    </div>
  );
};

export default EdisonProposal;
