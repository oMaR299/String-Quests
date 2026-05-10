/**
 * DesignSystemLayout — route entry for /design-system/*.
 *
 * Composes the AdminShell pattern with the five tabs:
 *   Tokens / Typography / Components / Patterns / Rules.
 */

import React, { useState } from 'react';
import {
  Palette,
  Type as TypeIcon,
  Box,
  Layers,
  AlertTriangle,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { SqAdminShell } from '../patterns/AdminShell';
import { DesignSystemTokensTab } from './DesignSystemTokensTab';
import { DesignSystemTypographyTab } from './DesignSystemTypographyTab';
import { DesignSystemComponentsTab } from './DesignSystemComponentsTab';
import { DesignSystemPatternsTab } from './DesignSystemPatternsTab';
import { DesignSystemRulesTab } from './DesignSystemRulesTab';

interface DesignSystemLayoutProps {
  onExit?: () => void;
}

type Tab = 'tokens' | 'typography' | 'components' | 'patterns' | 'rules';

export const DesignSystemLayout: React.FC<DesignSystemLayoutProps> = ({ onExit }) => {
  const [tab, setTab] = useState<Tab>('tokens');
  const [locale, setLocale] = useState<'ar' | 'en'>('en');

  const tabs = [
    { id: 'tokens',     label: locale === 'ar' ? 'الرموز' : 'Tokens',         icon: Palette },
    { id: 'typography', label: locale === 'ar' ? 'الطباعة' : 'Typography',    icon: TypeIcon },
    { id: 'components', label: locale === 'ar' ? 'المكونات' : 'Components',  icon: Box },
    { id: 'patterns',   label: locale === 'ar' ? 'الأنماط' : 'Patterns',      icon: Layers },
    { id: 'rules',      label: locale === 'ar' ? 'القواعد' : 'Rules',         icon: AlertTriangle },
  ];

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="h-screen overflow-hidden">
      <SqAdminShell
        title={locale === 'ar' ? 'نظام تصميم String' : 'String Design System'}
        eyebrow={locale === 'ar' ? 'لمصممي ومطوري المنصة' : 'For platform designers + engineers'}
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => setTab(id as Tab)}
        onExit={onExit}
        exitLabel={locale === 'ar' ? 'العودة' : 'Back'}
        dir={dir}
        rightSlot={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLocale((l) => (l === 'ar' ? 'en' : 'ar'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-bold transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'EN' : 'عربي'}
            </button>
          </div>
        }
      >
        {tab === 'tokens'     && <DesignSystemTokensTab />}
        {tab === 'typography' && <DesignSystemTypographyTab />}
        {tab === 'components' && <DesignSystemComponentsTab />}
        {tab === 'patterns'   && <DesignSystemPatternsTab />}
        {tab === 'rules'      && <DesignSystemRulesTab />}
      </SqAdminShell>
    </div>
  );
};

void ArrowLeft;

export default DesignSystemLayout;
