import React from 'react';

export const PinkDiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center relative`}>
    <div className="absolute w-full h-full bg-[#DA43D0] rotate-45 rounded-[3px] shadow-sm" />
    <div className="absolute w-[65%] h-[65%] bg-[#F499EB] rotate-45 rounded-[1px]" />
    <div className="absolute w-[35%] h-[35%] bg-[#FFD9FB] rotate-45" />
  </div>
);
