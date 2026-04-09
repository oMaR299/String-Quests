import React, { useState, useEffect, useRef } from 'react';
import { EdisonProposalPart1 } from './EdisonProposalPart1';
import { EdisonProposalPart2 } from './EdisonProposalPart2';

export const EdisonProposal: React.FC = () => {
  // Sticky nav: track current section
  const [activeSection, setActiveSection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="min-h-screen bg-white font-['Cairo']" dir="rtl">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/string-logo.png" alt="String" className="h-8 w-auto" />
            <span className="text-sm font-black text-slate-900">عرض أسعار</span>
          </div>
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
                title={`القسم ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-14">
        <EdisonProposalPart1 />
        <EdisonProposalPart2 />
      </div>
    </div>
  );
};

export default EdisonProposal;
