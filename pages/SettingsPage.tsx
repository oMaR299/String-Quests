import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useI18n } from '../contexts/I18nContext';
import { Globe, Volume2, VolumeX, Target } from 'lucide-react';
import { DAILY_GOALS, DailyGoalTier } from '../data/levelThresholds';

const SettingsPage: React.FC = () => {
  const { state, dispatch } = useUser();
  const { t, locale, toggleLocale } = useI18n();

  const goalTiers: { key: DailyGoalTier; label: string }[] = [
    { key: 'casual', label: locale === 'ar' ? 'مريح (50 XP)' : 'Casual (50 XP)' },
    { key: 'regular', label: locale === 'ar' ? 'منتظم (100 XP)' : 'Regular (100 XP)' },
    { key: 'serious', label: locale === 'ar' ? 'جاد (150 XP)' : 'Serious (150 XP)' },
    { key: 'intense', label: locale === 'ar' ? 'مكثف (200 XP)' : 'Intense (200 XP)' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black text-slate-800">{t('nav.settings')}</h1>

      {/* Language */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-duo-blue" />
          <h2 className="text-lg font-bold text-slate-800">{t('settings.language')}</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => locale !== 'ar' && toggleLocale()}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              locale === 'ar'
                ? 'bg-[#1CB0F6] text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => locale !== 'en' && toggleLocale()}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              locale === 'en'
                ? 'bg-[#1CB0F6] text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-duo-orange" />
          <h2 className="text-lg font-bold text-slate-800">{t('settings.daily_goal')}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {goalTiers.map((tier) => (
            <button
              key={tier.key}
              onClick={() => dispatch({ type: 'SET_DAILY_GOAL', payload: tier.key })}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                state.dailyGoalTier === tier.key
                  ? 'bg-[#FF9600] text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sound */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-duo-purple" />
          <h2 className="text-lg font-bold text-slate-800">{t('settings.sound')}</h2>
          <div className="flex-1" />
          <div className="w-12 h-7 bg-[#58CC02] rounded-full relative cursor-pointer">
            <div className="absolute top-0.5 right-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all" />
          </div>
        </div>
      </div>

      {/* SFX (power-up activation sounds) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          {state.sfxEnabled ? (
            <Volume2 className="w-5 h-5 text-duo-purple" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-800">{t('settings.sfx')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'ar'
                ? 'يتحكم في أصوات تفعيل القدرات أثناء الأسئلة.'
                : 'Controls power-up activation sounds during questions.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.sfxEnabled}
            aria-label={t('settings.sfx')}
            onClick={() => dispatch({ type: 'TOGGLE_SFX' })}
            className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-cairo border transition-all ${
              state.sfxEnabled
                ? 'bg-[#58CC02] text-white border-[#58CC02] shadow-sm'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                state.sfxEnabled ? 'bg-white' : 'bg-slate-400'
              }`}
            />
            {state.sfxEnabled ? t('settings.sfx_on') : t('settings.sfx_off')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
