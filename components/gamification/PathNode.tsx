import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Crown, Play, Star } from 'lucide-react';
import {
  Calculator, Languages, Globe, Layers, Brain, Cat, Map, Dna,
  Landmark, Atom, FlaskConical, Moon, BookOpen, Monitor, Palette,
  Activity, Mountain, MessageCircle, MessageSquare, Coins, Dumbbell, Sparkles,
} from 'lucide-react';

export type NodeStatus = 'locked' | 'available' | 'current' | 'completed' | 'perfect';

interface PathNodeProps {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  color: string;
  bg: string;
  status: NodeStatus;
  stars: 0 | 1 | 2 | 3;
  position: 'left' | 'center' | 'right';
  questionCount: number;
  completionPercent: number;
  onClick: () => void;
}

const getIcon = (iconName: string, className: string) => {
  const props = { className };
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

const statusConfig = {
  locked: {
    ring: 'border-slate-300 bg-slate-100',
    iconColor: 'text-slate-400',
    shadow: '',
    label: 'bg-slate-200 text-slate-400',
  },
  available: {
    ring: 'border-slate-300 bg-white',
    iconColor: '',
    shadow: 'shadow-lg',
    label: 'bg-white text-slate-600',
  },
  current: {
    ring: 'border-[#58CC02] bg-white',
    iconColor: '',
    shadow: 'shadow-xl shadow-green-500/20',
    label: 'bg-[#58CC02] text-white',
  },
  completed: {
    ring: 'border-[#FFC800] bg-white',
    iconColor: '',
    shadow: 'shadow-lg shadow-yellow-500/10',
    label: 'bg-[#FFC800] text-yellow-900',
  },
  perfect: {
    ring: 'border-[#FFC800] bg-gradient-to-br from-yellow-50 to-amber-50',
    iconColor: '',
    shadow: 'shadow-xl shadow-yellow-500/20',
    label: 'bg-[#FFC800] text-yellow-900',
  },
};

// Ring color based on completion percentage
function getRingColor(percent: number): string {
  if (percent >= 100) return '#FFC800';  // gold — complete
  if (percent >= 80) return '#58CC02';   // green — almost done
  if (percent >= 50) return '#F59E0B';   // amber — making progress
  if (percent > 0) return '#EF4444';     // red — just started
  return 'transparent';
}

const StarDisplay: React.FC<{ stars: 0 | 1 | 2 | 3 }> = ({ stars }) => {
  if (stars === 0) return null;
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= stars ? 'text-[#FFC800] fill-[#FFC800]' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
};

// SVG Progress Ring component
const ProgressRing: React.FC<{ percent: number; status: NodeStatus }> = ({ percent, status }) => {
  if (status === 'locked' || percent <= 0) return null;

  const size = 96;          // SVG viewBox size
  const cx = size / 2;
  const cy = size / 2;
  const radius = 43;        // ring radius (just outside the 80px / 40px node border)
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  const ringColor = getRingColor(percent);

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 m-auto pointer-events-none"
      style={{ width: size, height: size, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
        opacity={0.4}
      />
      {/* Progress arc */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
    </svg>
  );
};

export const PathNode: React.FC<PathNodeProps> = ({
  titleAr,
  icon,
  color,
  status,
  stars,
  position,
  questionCount,
  completionPercent,
  onClick,
}) => {
  const config = statusConfig[status];
  const isClickable = status !== 'locked';

  const offsetClass =
    position === 'left' ? '-translate-x-16' :
    position === 'right' ? 'translate-x-16' : '';

  return (
    <motion.div
      className={`flex flex-col items-center ${offsetClass}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Node Circle with Progress Ring */}
      <div className="relative">
        <motion.button
          onClick={isClickable ? onClick : undefined}
          disabled={!isClickable}
          whileHover={isClickable ? { scale: 1.08 } : {}}
          whileTap={isClickable ? { scale: 0.95 } : {}}
          className={`
            relative w-20 h-20 rounded-full border-[5px] flex items-center justify-center
            transition-all duration-300
            ${config.ring} ${config.shadow}
            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
            ${status === 'current' ? 'animate-pulse' : ''}
          `}
        >
          {/* Status overlay */}
          {status === 'locked' && (
            <Lock className="w-7 h-7 text-slate-400" />
          )}
          {status === 'perfect' && (
            <div className="absolute -top-2 -right-1 z-10">
              <Crown className="w-6 h-6 text-[#FFC800] fill-[#FFC800] drop-shadow" />
            </div>
          )}
          {(status === 'completed' || status === 'perfect') && (
            <div className="absolute -bottom-1 -right-1 z-10 w-6 h-6 bg-[#58CC02] rounded-full flex items-center justify-center border-2 border-white">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          )}

          {/* Icon */}
          {status !== 'locked' && (
            getIcon(icon, `w-8 h-8 ${config.iconColor || color}`)
          )}

          {/* Current node glow ring */}
          {status === 'current' && (
            <motion.div
              className="absolute inset-[-8px] rounded-full border-2 border-[#58CC02]/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* SVG Progress Ring */}
        <ProgressRing percent={completionPercent} status={status} />

        {/* Question Count Badge */}
        {questionCount > 0 && status !== 'locked' && (
          <div className="absolute -bottom-1 -left-1 z-10 w-5 h-5 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[9px] font-bold text-slate-500">{questionCount}</span>
          </div>
        )}
      </div>

      {/* Label */}
      <div className={`mt-2 px-3 py-1 rounded-xl text-xs font-bold ${config.label}`}>
        {status === 'current' && <Play className="w-3 h-3 inline-block mr-1 fill-current" />}
        {titleAr}
      </div>

      {/* Stars */}
      <StarDisplay stars={stars} />
    </motion.div>
  );
};
