
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, BrainCircuit, HelpCircle, Flame, Target, Trophy, Info, 
  Package, Download, Calculator, Languages, Globe, Layers, Brain, 
  Cat, Map, Dna, Sparkles, Landmark, Atom, FlaskConical, Moon, 
  BookOpen, Monitor, Palette, Activity, Mountain, MessageCircle, 
  MessageSquare, Coins, Dumbbell
} from 'lucide-react';
import { Button } from './Button';
import { GameRulesModal } from './GameRulesModal';
import { BoostIcon } from './BoostIcon';
import { InfoHelpModal } from './InfoHelpModal';
import { TOPIC_META } from '../constants';

interface StartScreenProps {
  onStart: () => void;
  totalXP: number;
  accuracy: number;
  streak: number;
  totalBoosts: number;
}

// Helper for consistent Diamond Icon
const PinkDiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center relative`}>
      <div className="absolute w-full h-full bg-[#DA43D0] rotate-45 rounded-[3px] shadow-sm" />
      <div className="absolute w-[65%] h-[65%] bg-[#F499EB] rotate-45 rounded-[1px]" />
      <div className="absolute w-[35%] h-[35%] bg-[#FFD9FB] rotate-45" />
  </div>
);

// --- ASSET GENERATION HELPERS ---

const TAILWIND_TO_HEX: Record<string, string> = {
  "text-blue-500": "#3b82f6",
  "text-purple-500": "#a855f7",
  "text-emerald-500": "#10b981",
  "text-orange-500": "#f97316",
  "text-indigo-500": "#6366f1",
  "text-yellow-600": "#ca8a04",
  "text-teal-500": "#14b8a6",
  "text-pink-500": "#ec4899",
  "text-amber-600": "#d97706",
  "text-violet-500": "#8b5cf6",
  "text-cyan-500": "#06b6d4",
  "text-green-600": "#16a34a",
  "text-rose-500": "#f43f5e",
  "text-sky-600": "#0284c7",
  "text-fuchsia-500": "#d946ef",
  "text-emerald-600": "#059669",
  "text-stone-600": "#57534e",
  "text-blue-600": "#2563eb",
  "text-lime-600": "#65a30d",
  "text-red-500": "#ef4444",
  "text-slate-600": "#475569"
};

const renderIconForExport = (iconName: string, colorHex: string = 'currentColor') => {
    const props = { size: 24, strokeWidth: 2, color: colorHex };
    switch (iconName) {
        case 'calculator': return <Calculator {...props} />;
        case 'languages': return <Languages {...props} />;
        case 'globe': return <Globe {...props} />;
        case 'layers': return <Layers {...props} />;
        case 'brain': return <Brain {...props} />;
        case 'cat': return <Cat {...props} />;
        case 'map': return <Map {...props} />;
        case 'dna': return <Dna {...props} />;
        case 'landmark': return <Landmark {...props} />;
        case 'atom': return <Atom {...props} />;
        case 'flask': return <FlaskConical {...props} />;
        case 'moon': return <Moon {...props} />;
        case 'book': return <BookOpen {...props} />;
        case 'monitor': return <Monitor {...props} />;
        case 'palette': return <Palette {...props} />;
        case 'activity': return <Activity {...props} />;
        case 'mountain': return <Mountain {...props} />;
        case 'message-circle': return <MessageCircle {...props} />;
        case 'message-square': return <MessageSquare {...props} />;
        case 'coins': return <Coins {...props} />;
        case 'dumbbell': return <Dumbbell {...props} />;
        default: return <Sparkles {...props} />;
    }
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart, totalXP, accuracy, streak, totalBoosts }) => {
  const [showRules, setShowRules] = useState(false);
  const [infoConfig, setInfoConfig] = useState<{open: boolean, title: string, desc: string, icon?: React.ReactNode}>({
      open: false, title: '', desc: ''
  });

  const openInfo = (title: string, desc: string, icon: React.ReactNode) => {
      setInfoConfig({ open: true, title, desc, icon });
  };

  const downloadSingleSvg = (topic: string) => {
    const el = document.getElementById(`export-icon-${topic}`);
    if (!el) return;
    
    // Extract the inner HTML (the <svg> tag)
    const svgContent = el.innerHTML;
    
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${topic}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
      { 
        icon: <PinkDiamondIcon className="w-5 h-5" />, 
        label: "مجموع النقاط", 
        value: totalXP.toLocaleString(), 
        color: "bg-pink-50 border-pink-100 text-pink-600",
        desc: "النقاط التي جمعتها من حل التمارين وإكمال المهام."
      },
      { 
        icon: <Target className="w-5 h-5 text-blue-500" />, 
        label: "الدقة", 
        value: `${accuracy}%`, 
        color: "bg-blue-50 border-blue-100 text-blue-600",
        desc: "نسبة إجاباتك الصحيحة من إجمالي محاولاتك."
      },
      { 
        icon: <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />, 
        label: "حماس يومي", 
        value: streak, 
        color: "bg-orange-50 border-orange-100 text-orange-600",
        desc: "عدد الأيام المتتالية التي لعبت فيها دون انقطاع."
      },
      { 
        icon: <BoostIcon className="w-5 h-5" />, 
        label: "Boosts", 
        value: totalBoosts, 
        color: "bg-purple-50 border-purple-100 text-purple-600",
        desc: "معززات يمكنك استخدامها لمضاعفة نقاطك."
      }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative z-10 pb-12">
      <InfoHelpModal 
        isOpen={infoConfig.open} 
        onClose={() => setInfoConfig({...infoConfig, open: false})}
        title={infoConfig.title}
        description={infoConfig.desc}
        icon={infoConfig.icon}
      />

      {/* Hidden Container for Asset Generation */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -100 }}>
         {Object.entries(TOPIC_META).map(([topic, meta]) => (
             <div key={topic} id={`export-icon-${topic}`}>
                 {renderIconForExport(meta.icon, TAILWIND_TO_HEX[meta.color] || '#000000')}
             </div>
         ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative w-full max-w-md"
      >
        {/* Floating Decorative Cards behind */}
        <motion.div 
            animate={{ rotate: -6, x: -20 }}
            className="absolute inset-0 bg-blue-100 rounded-[3rem] -z-10 opacity-60" 
        />
        <motion.div 
            animate={{ rotate: 6, x: 20 }}
            className="absolute inset-0 bg-purple-100 rounded-[3rem] -z-10 opacity-60" 
        />

        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white w-full text-center">
          
          {/* Hero Icon */}
          <motion.div 
            className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform rotate-3"
            whileHover={{ rotate: 0, scale: 1.05 }}
          >
            <BrainCircuit className="text-white w-10 h-10" />
          </motion.div>

          <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">تحدي المعرفة</h1>
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
              {stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => openInfo(stat.label, stat.desc, stat.icon)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center ${stat.color} shadow-sm cursor-pointer hover:shadow-md transition-shadow relative group`}
                  >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info className="w-3 h-3" />
                      </div>
                      <div className="flex items-center gap-2 mb-1 opacity-80">
                          {stat.icon}
                          <span className="text-[10px] font-bold uppercase tracking-wide">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                  </motion.div>
              ))}
          </div>

          {/* Action Button */}
          <Button onClick={onStart} size="lg" fullWidth className="text-lg group mb-4 shadow-xl shadow-slate-800/20">
            <span className="relative z-10 flex items-center gap-2">
                ابـدأ رحلة اليوم
                <Play className="w-5 h-5 fill-current group-hover:translate-x-[-4px] transition-transform" />
            </span>
          </Button>

          {/* Tutorial Link */}
          <button 
            onClick={() => setShowRules(true)}
            className="text-slate-400 hover:text-blue-500 font-bold text-sm flex items-center justify-center gap-2 transition-colors mx-auto py-2 px-4 hover:bg-blue-50 rounded-xl w-full"
          >
            <HelpCircle className="w-4 h-4" />
            كيف ألعب؟
          </button>

          {/* --- ASSISTS SECTION (Icon Downloader) --- */}
          <div className="mt-8 pt-6 border-t border-slate-100 w-full text-left">
             <div className="flex items-center justify-between mb-3 px-1">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                     <Package className="w-3 h-3" />
                     Download Icons (SVG)
                 </h3>
             </div>
             
             <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                 {Object.entries(TOPIC_META).map(([topic, meta]) => (
                     <button 
                        key={topic}
                        onClick={() => downloadSingleSvg(topic)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all group h-24 relative"
                        title={`Download ${topic}.svg`}
                     >
                         <div className={`${meta.color} mb-1 group-hover:scale-110 transition-transform`}>
                             {renderIconForExport(meta.icon)}
                         </div>
                         <span className="text-[8px] font-bold text-slate-400 uppercase truncate w-full text-center mb-1">{topic}</span>
                         
                         <div className="bg-slate-200 text-slate-500 rounded-full p-1 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Download className="w-3 h-3" />
                         </div>
                     </button>
                 ))}
             </div>
          </div>

        </div>
      </motion.div>

      {/* Rules Modal */}
      <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default StartScreen;
