import React from 'react';
import { useSounds } from '../hooks/useSounds';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  playSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  disabled,
  playSound = true,
  onClick,
  ...props 
}) => {
  const { playClick } = useSounds();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && playSound) {
      playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles = "relative rounded-2xl font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-4 focus-visible:ring-blue-200";
  
  const variants = {
    primary: "bg-slate-800 text-white shadow-xl shadow-slate-800/20 hover:bg-slate-700 hover:shadow-2xl hover:-translate-y-0.5 border border-white/10",
    secondary: "bg-white text-slate-700 border-2 border-slate-100 shadow-sm hover:border-slate-200 hover:bg-slate-50",
    outline: "bg-transparent border-2 border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};