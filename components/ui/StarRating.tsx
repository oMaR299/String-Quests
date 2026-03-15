import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: 0 | 1 | 2 | 3;
  size?: 'sm' | 'md';
}

export const StarRating: React.FC<StarRatingProps> = ({ stars, size = 'sm' }) => {
  if (stars === 0) return null;
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= stars ? 'text-[#FFC800] fill-[#FFC800]' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
};
