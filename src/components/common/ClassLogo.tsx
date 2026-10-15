import React from 'react';

interface ClassLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withBorder?: boolean;
  withGlow?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11 sm:w-12 sm:h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32',
};

export const ClassLogo: React.FC<ClassLogoProps> = ({
  className = '',
  size = 'md',
  withBorder = true,
  withGlow = false,
  showTooltip = true,
  onClick,
}) => {
  return (
    <div 
      className={`relative inline-block rounded-full select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      title={showTooltip ? 'Lớp 12A2 • Đoàn Kết & Chia Sẻ (Niên khóa 2024–2027)' : undefined}
    >
      <img
        src="/logo.png"
        alt="Logo Lớp 12A2 - Đoàn Kết Và Chia Sẻ (Niên Khóa 2024-2027)"
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover aspect-square transition-transform duration-300 hover:scale-105 ${
          sizeClasses[size]
        } ${
          withBorder 
            ? 'border-2 border-white/80 shadow-md ring-2 ring-amber-400/60 bg-amber-50' 
            : 'shadow-sm'
        } ${
          withGlow ? 'ring-4 ring-amber-400/80 shadow-lg shadow-amber-500/30' : ''
        }`}
      />
    </div>
  );
};
