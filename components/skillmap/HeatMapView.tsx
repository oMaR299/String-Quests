import React from 'react';
import { motion } from 'framer-motion';
import { SkillMastery, MASTERY_COLORS } from '../../utils/masteryEngine';
import { getSkillsBySubject, BLOOM_LABELS } from '../../data/skillTaxonomy';
import { TOPIC_META } from '../../constants';

interface Props {
  masteries: SkillMastery[];
  locale: string;
  onSelectSkill: (mastery: SkillMastery) => void;
}

export const HeatMapView: React.FC<Props> = ({ masteries, locale, onSelectSkill }) => {
  const bySubject = getSkillsBySubject();
  const subjects = Object.keys(bySubject);

  return (
    <div className="space-y-4">
      {subjects.map((subject, sIdx) => {
        const skills = bySubject[subject];
        const meta = TOPIC_META[subject];

        return (
          <motion.div
            key={subject}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.05 }}
          >
            {/* Subject header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className={`w-6 h-6 rounded-lg ${meta?.bg || 'bg-slate-100'} flex items-center justify-center`}>
                <span className="text-xs">{
                  meta?.icon === 'calculator' ? '🧮' :
                  meta?.icon === 'languages' ? '🌐' :
                  meta?.icon === 'globe' ? '🌍' :
                  meta?.icon === 'layers' ? '📊' :
                  meta?.icon === 'brain' ? '🧠' :
                  meta?.icon === 'cat' ? '🐱' :
                  meta?.icon === 'map' ? '🗺️' :
                  meta?.icon === 'dna' ? '🧬' :
                  meta?.icon === 'landmark' ? '🏛️' :
                  meta?.icon === 'atom' ? '⚛️' :
                  meta?.icon === 'flask' ? '🧪' :
                  meta?.icon === 'moon' ? '🌙' :
                  meta?.icon === 'book' ? '📖' :
                  meta?.icon === 'monitor' ? '💻' :
                  meta?.icon === 'palette' ? '🎨' :
                  meta?.icon === 'activity' ? '🦠' :
                  meta?.icon === 'mountain' ? '🏔️' :
                  meta?.icon === 'message-circle' ? '🇬🇧' :
                  meta?.icon === 'message-square' ? '🇫🇷' :
                  meta?.icon === 'coins' ? '💰' :
                  meta?.icon === 'dumbbell' ? '🏃' :
                  '📚'
                }</span>
              </div>
              <span className="text-sm font-bold text-slate-700">{subject}</span>
              <span className="text-xs text-slate-400">({skills.length})</span>
            </div>

            {/* Skills grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {skills.map((skillDef, i) => {
                const mastery = masteries.find(m => m.skill.questionId === skillDef.questionId);
                if (!mastery) return null;

                const bgColor = MASTERY_COLORS[mastery.status];
                const isUnstarted = mastery.status === 'unstarted';

                return (
                  <motion.button
                    key={skillDef.questionId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: sIdx * 0.05 + i * 0.03 }}
                    onClick={() => onSelectSkill(mastery)}
                    className={`
                      relative p-3 rounded-xl border-2 text-left
                      transition-all duration-150 hover:scale-105 hover:shadow-lg
                      ${isUnstarted
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'border-transparent hover:border-white'
                      }
                    `}
                    style={isUnstarted ? {} : { backgroundColor: `${bgColor}15`, borderColor: `${bgColor}30` }}
                  >
                    {/* Skill code */}
                    <span className="text-[9px] font-bold text-slate-400 block mb-1">
                      {skillDef.skillCode}
                    </span>

                    {/* Skill name */}
                    <span className={`text-xs font-bold block leading-tight mb-2 ${isUnstarted ? 'text-slate-400' : 'text-slate-700'}`}>
                      {locale === 'ar' ? skillDef.skillNameAr : skillDef.skillNameEn}
                    </span>

                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-lg font-black"
                        style={{ color: isUnstarted ? '#94a3b8' : bgColor }}
                      >
                        {mastery.masteryScore}
                      </span>

                      {/* Bloom's dots */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5, 6].map(lvl => (
                          <div
                            key={lvl}
                            className={`w-1.5 h-1.5 rounded-full ${
                              lvl <= skillDef.bloomLevel ? 'bg-purple-400' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-2 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: bgColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery.masteryScore}%` }}
                        transition={{ duration: 0.8, delay: sIdx * 0.05 + i * 0.03 }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
