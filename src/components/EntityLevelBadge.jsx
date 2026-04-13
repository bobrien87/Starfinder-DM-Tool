import React from 'react';

export default function EntityLevelBadge({ level, isPC = false, className = "" }) {
  return (
    <div className={`bg-[#fad23f] pr-4 pl-6 py-[14px] shadow-sm text-center shrink-0 flex items-center justify-center text-black [clip-path:polygon(0_0,100%_0,100%_100%,15px_100%,0_calc(100%_-_15px))] ${className}`}>
      <span className="text-base font-[700] font-headline tracking-widest leading-none whitespace-nowrap m-0 pt-[2px] text-black drop-shadow-none">
        {isPC ? 'Level' : 'Creature'} {level ?? '?'}
      </span>
    </div>
  );
}
