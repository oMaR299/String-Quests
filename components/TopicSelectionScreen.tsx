
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, Languages, Globe, Layers, Brain, 
  Cat, Map, Dna, Sparkles, ChevronLeft, Play,
  Landmark, Atom, FlaskConical, Moon, BookOpen, Monitor, Palette,
  Activity, Mountain, MessageCircle, MessageSquare, Coins, Dumbbell,
  Trophy, Percent, Flame, Calendar, Zap, Infinity, Book, User, Grid
} from 'lucide-react';
import { Button } from './Button';
import { TOPIC_META } from '../constants';
import { Question } from '../types';

interface TopicSelectionScreenProps {
  availableQuestions: Question[];
  onSelectTopic: (topic: string | null) => void; // Goes to lessons view
  onQuickStart: (topic: string | null) => void; // Starts game immediately
  onBack: () => void;
  onOpenStreak: () => void;
}

const PinkDiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center relative`}>
      <div className="absolute w-full h-full bg-[#DA43D0] rotate-45 rounded-[3px] shadow-sm" />
      <div className="absolute w-[65%] h-[65%] bg-[#F499EB] rotate-45 rounded-[1px]" />
      <div className="absolute w-[35%] h-[35%] bg-[#FFD9FB] rotate-45" />
  </div>
);

// Helper to render the correct icon
const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'calculator': return <Calculator className={className} />;
    case 'languages': return <Languages className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'layers': return <Layers className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'cat': return <Cat className={className} />;
    case 'map': return <Map className={className} />;
    case 'dna': return <Dna className={className} />;
    case 'landmark': return <Landmark className={className} />;
    case 'atom': return <Atom className={className} />;
    case 'flask': return <FlaskConical className={className} />;
    case 'moon': return <Moon className={className} />;
    case 'book': return <BookOpen className={className} />;
    case 'monitor': return <Monitor className={className} />;
    case 'palette': return <Palette className={className} />;
    case 'activity': return <Activity className={className} />;
    case 'mountain': return <Mountain className={className} />;
    case 'message-circle': return <MessageCircle className={className} />;
    case 'message-square': return <MessageSquare className={className} />;
    case 'coins': return <Coins className={className} />;
    case 'dumbbell': return <Dumbbell className={className} />;
    default: return <Sparkles className={className} />;
  }
};

// Helper to generate card styling and text based on topic
const getTopicConfig = (subject: string, meta: any) => {
    if (subject === 'mix') {
        return {
            title: "تحدي شامل",
            desc: "خليط من جميع الأسئلة المتوفرة.",
            gradient: "from-slate-700 to-slate-900",
            shadow: "shadow-slate-500/30",
            decor1: "bg-slate-300",
            decor2: "bg-slate-200",
            tags: ["🧠 ذكاء", "🏆 تحدي"]
        };
    }

    // Derive style from the meta color string (e.g., "text-blue-500")
    const colorParts = meta.color.split('-');
    const colorBase = colorParts[1]; // e.g., "blue"
    
    let desc = "";
    let tags: string[] = [];
    
    switch(subject) {
        case "رياضيات": 
            desc = "مسائل حسابية وألغاز لتنشيط العقل.";
            tags = ["🔢 أرقام"];
            break;
        case "لغات":
            desc = "تحدي الكلمات والمعاني.";
            tags = ["🗣️ كلمات"];
            break;
        case "ثقافة عامة":
            desc = "معلومات عامة من حول العالم.";
            tags = ["🌍 عالم"];
            break;
        case "ترتيب":
            desc = "رتب الأحداث في تسلسلها الصحيح.";
            tags = ["🔃 منطق"];
            break;
        case "حيوانات":
             desc = "أسرار الغابة وعالم الحيوان.";
             tags = ["🦁 طبيعة"];
             break;
        case "علوم":
            desc = "حقائق علمية ممتعة للأطفال.";
            tags = ["🧪 علوم"];
            break;
        case "جغرافيا":
            desc = "الدول والعواصم والخرائط.";
            tags = ["🗺️ خرائط"];
            break;
        case "تاريخ":
            desc = "رحلة عبر الزمن والأحداث المهمة.";
            tags = ["🏺 حضارات"];
            break;
        case "فيزياء":
             desc = "قوانين الحركة والطاقة والكون.";
             tags = ["⚡ طاقة"];
             break;
        case "كيمياء":
            desc = "العناصر والتفاعلات والمادة.";
            tags = ["🧪 عناصر"];
            break;
        case "تربية إسلامية":
            desc = "قيم ومبادئ وشريعة.";
            tags = ["🕌 دين"];
            break;
        case "لغة عربية":
            desc = "نحو وصرف وبلاغة لغة الضاد.";
            tags = ["📖 أدب"];
            break;
        case "حاسوب":
            desc = "البرمجة والتقنية الرقمية.";
            tags = ["💻 تقنية"];
            break;
        case "فنون":
            desc = "الإبداع والألوان والرسم.";
            tags = ["🎨 إبداع"];
            break;
        case "أحياء":
            desc = "جسم الإنسان والكائنات الحية.";
            tags = ["🧬 حياة"];
            break;
        case "علوم الأرض":
            desc = "طبقات الأرض والبراكين والصخور.";
            tags = ["🌋 جيولوجيا"];
            break;
        case "لغة إنجليزية":
            desc = "كلمات وقواعد اللغة الإنجليزية.";
            tags = ["🇬🇧 English"];
            break;
        case "لغة فرنسية":
            desc = "أساسيات اللغة الفرنسية.";
            tags = ["🇫🇷 Français"];
            break;
        case "تربية مالية":
            desc = "الادخار والاستثمار وإدارة المال.";
            tags = ["💰 مال"];
            break;
        case "تربية رياضية":
            desc = "الرياضة، القوانين، والصحة.";
            tags = ["⚽ نشاط"];
            break;
        default:
            desc = `أسئلة ممتعة في مجال ${subject}.`;
            tags = ["✨ جديد"];
    }

    return {
        title: subject,
        desc,
        gradient: `from-${colorBase}-400 to-${colorBase}-600`,
        shadow: `shadow-${colorBase}-500/30`,
        decor1: `bg-${colorBase}-200`,
        decor2: `bg-${colorBase}-100`, 
        tags
    };
};

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({ 
  availableQuestions, 
  onSelectTopic,
  onQuickStart,
  onBack,
  onOpenStreak
}) => {
  const subjects: string[] = Array.from(new Set(availableQuestions.map(q => q.subject)));
  const allTopics: string[] = ['mix', ...subjects];

  return (
    <div className="w-full py-8 relative z-10 flex flex-col items-center">
      
      {/* Header with Profile Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center max-w-[1400px] px-6 mb-12"
      >
          {/* Back Button */}
          <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400 hover:bg-white/50 hidden md:flex">
              <ChevronLeft className="w-5 h-5 ml-1" />
              الرئيسية
          </Button>
          
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tight">اختر التحدي</h2>
            <p className="text-slate-500 text-lg font-medium">
                اختر موضوعاً وابدأ الرحلة!
            </p>
          </div>
          
          {/* Dashboard Button */}
          <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={onOpenStreak}
             className="relative flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-xl shadow-slate-200/50 border border-slate-100 cursor-pointer group hover:border-orange-200 transition-colors"
          >
             <div className="text-right hidden sm:block">
                 <div className="text-[10px] font-bold text-slate-400 uppercase">مركز القيادة</div>
                 <div className="text-sm font-black text-slate-800 group-hover:text-orange-500 transition-colors">بروفايلي</div>
             </div>
             <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md text-white ring-4 ring-white">
                <Grid className="w-5 h-5" />
             </div>
             {/* Notification Dot */}
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </motion.button>
      </motion.div>

      {/* SPECIAL CHALLENGES SECTION */}
      <div className="w-full max-w-[1400px] px-4 mb-8 flex flex-col gap-6">
        
        {/* ROW 1: Practice (Hero) */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="w-full relative group cursor-pointer"
            onClick={() => onQuickStart('practice')}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#2A1B3D] via-[#DA43D0] to-[#44318D] rounded-[2.5rem] blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-[#2A1B3D] to-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-overlay translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6 md:gap-8 text-center md:text-right flex-1">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(218,67,208,0.2)] border border-white/20 shrink-0 relative group-hover:rotate-12 transition-transform duration-700">
                             <div className="absolute -top-2 -right-2 animate-bounce delay-700"><PinkDiamondIcon className="w-8 h-8" /></div>
                             <div className="absolute -bottom-2 -left-2 animate-bounce"><PinkDiamondIcon className="w-6 h-6 opacity-70" /></div>
                             <Infinity className="w-12 h-12 md:w-16 md:h-16 text-pink-200 drop-shadow-[0_0_15px_rgba(249,168,212,0.6)]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                  <PinkDiamondIcon className="w-3 h-3" />
                                  الأكثر تميزاً
                                </span>
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">وضع التدريب المفتوح</h3>
                            <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-xl">
                                تمرن بلا حدود على جميع الأسئلة المتاحة بدون وقت وبدون خسارة.
                            </p>
                        </div>
                    </div>
                    
                    <div className="shrink-0">
                        <Button variant="secondary" size="lg" className="bg-white text-indigo-900 hover:bg-pink-50 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] px-10 py-4 text-xl">
                            ابدأ التدريب الآن ⚡
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* ROW 2: Daily & Weekly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Challenge */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                onClick={() => onQuickStart('daily')}
                className="relative group cursor-pointer"
            >
                <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 border-2 border-white/20 overflow-hidden min-h-[240px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Calendar className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10">
                         <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                            <Calendar className="w-7 h-7 text-white" />
                         </div>
                         <h3 className="text-3xl font-black mb-2">التحدي اليومي</h3>
                         <p className="text-blue-100 font-medium text-lg">5 أسئلة جديدة كل يوم لتنشيط عقلك.</p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                         <div className="px-3 py-1 bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm flex items-center gap-2 border border-white/10">
                            <PinkDiamondIcon className="w-4 h-4" />
                            <span>500 نقطة</span>
                         </div>
                         <div className="h-1 flex-1 bg-blue-900/20 rounded-full overflow-hidden">
                             <div className="h-full w-3/4 bg-white/80 rounded-full"></div>
                         </div>
                    </div>
                </div>
            </motion.div>

            {/* Weekly Challenge */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                onClick={() => onQuickStart('weekly')}
                className="relative group cursor-pointer"
            >
                <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-purple-500/20 border-2 border-white/20 overflow-hidden min-h-[240px] flex flex-col justify-between">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Trophy className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                         <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                            <Trophy className="w-7 h-7 text-white" />
                         </div>
                         <h3 className="text-3xl font-black mb-2">بطل الأسبوع</h3>
                         <p className="text-purple-100 font-medium text-lg">تحدي شامل للمحترفين فقط.</p>
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                         <div className="px-3 py-1 bg-white/20 rounded-lg text-sm font-bold backdrop-blur-sm flex items-center gap-2 border border-white/10">
                             <PinkDiamondIcon className="w-4 h-4" />
                             <span>2000 نقطة</span>
                         </div>
                         <span className="px-3 py-1 bg-amber-400/90 text-amber-900 rounded-lg text-sm font-bold shadow-sm">ينتهي قريباً</span>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Standard Cards Container */}
      <div className="flex flex-wrap justify-center items-start gap-8 md:gap-10 w-full px-4 max-w-[1400px]">
        {allTopics.map((subject, index) => {
          const isMix = subject === 'mix';
          const targetSubject = isMix ? 'mix' : subject;
          
          // Calculate Stats
          const questionsForTopic = isMix 
            ? availableQuestions 
            : availableQuestions.filter(q => q.subject === subject);
          
          const count = questionsForTopic.length;
          const totalPoints = questionsForTopic.reduce((acc, curr) => acc + curr.points, 0);
          const completion = 0; 

          const meta = TOPIC_META[subject] || TOPIC_META['mix'];
          const config = getTopicConfig(subject, meta);

          return (
            <motion.div
              key={subject}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.2, type: "spring", duration: 0.8 }}
              className="relative w-full max-w-[340px] flex-shrink-0 group perspective-1000 my-4"
            >
                {/* Stacked Cards Decorations */}
                <motion.div 
                    whileHover={{ rotate: -12, x: -20, y: 5, scale: 1.02 }}
                    className={`absolute inset-0 ${config.decor1} rounded-[2.5rem] -z-10 opacity-100 transform -rotate-6 translate-x-[-10px] translate-y-[5px] transition-transform duration-300 border-2 border-white/60 shadow-sm`} 
                />
                <motion.div 
                    whileHover={{ rotate: 12, x: 20, y: 10, scale: 1.02 }}
                    className={`absolute inset-0 ${config.decor2} rounded-[2.5rem] -z-20 opacity-100 transform rotate-6 translate-x-[10px] translate-y-[10px] transition-transform duration-300 border-2 border-white/60 shadow-sm`} 
                />

                {/* Main Card Content */}
                <div className="bg-white px-6 py-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border-2 border-white text-center flex flex-col items-center min-h-[500px] relative hover:-translate-y-2 transition-transform duration-300">
                    
                    {/* Large Icon Box */}
                    <motion.div 
                        whileHover={{ rotate: 0, scale: 1.1 }}
                        className={`w-20 h-20 bg-gradient-to-tr ${config.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-lg ${config.shadow} transform rotate-3 transition-transform duration-300`}
                    >
                        {getIcon(meta.icon, "text-white w-10 h-10 drop-shadow-md")}
                    </motion.div>

                    <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight leading-tight">{config.title}</h1>
                    
                    <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed line-clamp-2 h-[40px]">
                        {config.desc}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-slate-100 group-hover:border-slate-200 transition-colors">
                             <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <PinkDiamondIcon className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">النقاط</span>
                             </div>
                             <span className="text-xl font-black text-slate-700">{totalPoints}</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-slate-100 group-hover:border-slate-200 transition-colors">
                             <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <Layers className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">الأسئلة</span>
                             </div>
                             <span className="text-xl font-black text-slate-700">{count}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full mb-6">
                        <div className="flex justify-between items-end mb-2 px-1">
                            <span className="text-[11px] font-bold text-slate-400">نسبة الإنجاز</span>
                            <span className="text-xs font-black text-slate-600">{completion}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${completion}%` }}
                                className={`h-full bg-gradient-to-r ${config.gradient} opacity-80`} 
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-auto">
                        {config.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white rounded-lg text-slate-400 text-[10px] font-bold border border-slate-100 shadow-sm">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Buttons: Start & Lessons */}
                    <div className="w-full mt-6 flex flex-col gap-3">
                        <Button 
                            onClick={() => onQuickStart(targetSubject)} 
                            size="md" 
                            fullWidth 
                            className="text-lg group shadow-lg"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                ابدأ الآن
                                <Play className="w-4 h-4 fill-current group-hover:translate-x-[-2px] transition-transform" />
                            </span>
                        </Button>

                        <Button 
                            onClick={() => onSelectTopic(targetSubject)} 
                            size="sm" 
                            variant="secondary"
                            fullWidth 
                            className="text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-50 shadow-none"
                        >
                             <span className="flex items-center justify-center gap-2">
                                <Book className="w-4 h-4" />
                                الدروس ({count})
                             </span>
                        </Button>
                    </div>
                </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Mobile Back Button (visible only on small screens at bottom) */}
      <div className="mt-8 mb-8 md:hidden w-full px-6">
        <Button onClick={onBack} variant="ghost" fullWidth className="hover:bg-white/50 text-slate-500">
            <ChevronLeft className="w-5 h-5 ml-2" />
            العودة للقائمة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default TopicSelectionScreen;
