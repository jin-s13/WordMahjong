import React from 'react';
import type { Card } from '../types';
import { twMerge } from 'tailwind-merge';

interface MahjongTileProps {
  card: Card;
  selected?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MahjongTile: React.FC<MahjongTileProps> = ({
  card,
  selected = false,
  selectable = false,
  onClick,
  faceDown = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-2xl',
    md: 'w-14 h-20 text-3xl',
    lg: 'w-18 h-24 text-4xl',
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      emotion: 'text-rose-700',
      verb: 'text-blue-700',
      noun: 'text-emerald-700',
      adjective: 'text-violet-700',
      adverb: 'text-amber-700',
      scene: 'text-teal-700',
      supplement: 'text-gray-700',
    };
    return colors[category] || 'text-gray-800';
  };

  // 根据词性获取装饰图标
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      emotion: '❤',
      verb: '⚡',
      noun: '🏷️',
      adjective: '🎨',
      adverb: '✨',
      scene: '📍',
      supplement: '🔹',
    };
    return icons[category] || '🔹';
  };

  if (faceDown) {
    return (
      <div
        className={twMerge(
          'relative rounded-lg border-2 border-amber-900 bg-gradient-to-br from-amber-200 to-amber-300 shadow-lg flex items-center justify-center overflow-hidden',
          sizeClasses[size],
          selectable && 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200',
          selected && 'ring-2 ring-yellow-400 shadow-xl -translate-y-1'
        )}
        onClick={selectable ? onClick : undefined}
      >
        {/* 麻将背面纹理 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_#8b5a2b_1px,_transparent_1px)] bg-[length:4px_4px] opacity-20"></div>
        <div className="absolute inset-2 border-2 border-amber-800/30 rounded-md"></div>
        <div className="w-3/4 h-3/4 bg-gradient-to-br from-amber-800/10 to-amber-900/20 rounded-md"></div>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'relative rounded-lg border-2 border-amber-800 bg-gradient-to-br from-stone-50 to-amber-50 shadow-lg flex flex-col items-center justify-center overflow-hidden',
        sizeClasses[size],
        selectable && 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200',
        selected && 'ring-3 ring-yellow-400 shadow-xl -translate-y-2'
      )}
      onClick={selectable ? onClick : undefined}
    >
      {/* 牌面纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#e5e5e5_0.5px,_transparent_0.5px)] bg-[length:3px_3px] opacity-30"></div>
      
      {/* 顶部装饰角 */}
      <div className="absolute top-0.5 left-0.5 text-[10px] opacity-40">
        {getCategoryIcon(card.category)}
      </div>
      <div className="absolute top-0.5 right-0.5 text-[10px] opacity-40">
        {getCategoryIcon(card.category)}
      </div>

      {/* 汉字主体 */}
      <div className={twMerge(
        'font-bold font-serif tracking-wide relative z-10',
        getCategoryColor(card.category)
      )}>
        {card.char}
      </div>

      {/* 底部装饰角 */}
      <div className="absolute bottom-0.5 left-0.5 text-[10px] opacity-40 transform rotate-180">
        {getCategoryIcon(card.category)}
      </div>
      <div className="absolute bottom-0.5 right-0.5 text-[10px] opacity-40 transform rotate-180">
        {getCategoryIcon(card.category)}
      </div>

      {/* 卡片边缘光泽 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-black/10 pointer-events-none"></div>
      
      {/* 底部阴影 */}
      <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/20 blur-sm rounded-full"></div>
    </div>
  );
};

export default MahjongTile;