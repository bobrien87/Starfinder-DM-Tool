import React from 'react';
import { useDice } from '../context/DiceContext';
import SingleD20Icon from './SingleD20Icon';

const DoubleD20Icon = ({ className }) => {
  const maskId = React.useId ? React.useId() : 'd20mask-dbl';
  return (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 44 24" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id={maskId}>
        <rect width="44" height="24" fill="white" />
        <g fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2, 21 7, 21 17, 12 22, 3 17, 3 7" />
          <polygon points="7 9, 17 9, 12 17" />
          <line x1="12" y1="2" x2="7" y2="9" />
          <line x1="12" y1="2" x2="17" y2="9" />
          <line x1="3" y1="7" x2="7" y2="9" />
          <line x1="21" y1="7" x2="17" y2="9" />
          <line x1="3" y1="17" x2="7" y2="9" />
          <line x1="3" y1="17" x2="12" y2="17" />
          <line x1="21" y1="17" x2="17" y2="9" />
          <line x1="21" y1="17" x2="12" y2="17" />
          <line x1="12" y1="22" x2="12" y2="17" />
        </g>
      </mask>
    </defs>

    <g className="group-hover/btn:animate-spin [animation-duration:3s]" style={{ transformOrigin: '12px 12px' }}>
      <polygon points="12 2, 21 7, 21 17, 12 22, 3 17, 3 7" mask={`url(#${maskId})`} />
    </g>
    <g transform="translate(18, 0)">
      <g className="group-hover/btn:animate-spin [animation-duration:3s]" style={{ transformOrigin: '12px 12px', animationDelay: '100ms' }}>
        <polygon points="12 2, 21 7, 21 17, 12 22, 3 17, 3 7" mask={`url(#${maskId})`} />
      </g>
    </g>
  </svg>
  );
};

export default function StrikeActionGroup({ 
  name, 
  attackBonus, 
  damage, 
  traits = [], 
  causes = [],
  variant = null,
  theme = "primary",
  label = "Strike",
  saveDC = null,
  heal = null
}) {
  const { rollDice, rollDamage } = useDice();
  const formatMod = (num) => num >= 0 ? `+${num}` : num;
  
  const isAgile = traits.some(t => t.toLowerCase() === 'agile');
  const map1 = isAgile ? 4 : 5;
  const map2 = isAgile ? 8 : 10;
  
  // Theme colors explicitly bound to Native Interactive Stat Pill geometry
  const textBase = 'text-primary';
  const textMuted = 'text-primary';
  
  const borderBase = 'border-tertiary';
  const borderMuted = 'border-tertiary';
  
  const bgBase = 'bg-[#12111A]';
  const bgHover = 'hover:bg-[color-mix(in_srgb,#12111A,#ef574e_20%)] relative z-0 hover:z-10 hover:ring-1 hover:ring-secondary';
  const textHover = 'hover:text-primary';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
      {/* Strike Group */}
      {attackBonus !== undefined && attackBonus !== null && (
        <div className={`flex items-stretch shrink-0 border shadow-sm group/container ${borderBase}`}>
        <button 
          onClick={() => rollDice(`${name} Attack`, attackBonus, causes)} 
          className={`group/btn h-6 flex items-center px-1.5 text-[12px] font-label font-[500] leading-none pt-px transition-all cursor-pointer border-r ${bgBase} ${borderMuted} ${textBase} ${bgHover} ${textHover} gap-1`}
        >
          {variant === 'positive' && <span className="material-symbols-outlined text-[14px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)]">keyboard_double_arrow_up</span>}
          {variant === 'negative' && <span className="material-symbols-outlined text-[14px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)]">keyboard_double_arrow_down</span>}
          <SingleD20Icon className="w-4 h-4 group-hover/container:animate-spin [animation-duration:3s] opacity-80 shrink-0 text-primary transition-colors" />
          <span className="opacity-70">{label}</span> {formatMod(attackBonus)}
        </button>
        <button 
          onClick={() => rollDice(`${name} Attack`, attackBonus - map1, causes)} 
          className={`group/btn h-6 flex items-center px-2 text-[12px] font-label font-[500] leading-none pt-px transition-all cursor-pointer border-r ${bgBase} ${borderMuted} ${textMuted} ${bgHover} ${textHover}`}
        >
          {formatMod(attackBonus - map1)}
        </button>
        <button 
          onClick={() => rollDice(`${name} Attack`, attackBonus - map2, causes)} 
          className={`group/btn h-6 flex items-center px-2 text-[12px] font-label font-[500] leading-none pt-px transition-all cursor-pointer ${bgBase} ${textMuted} ${bgHover} ${textHover}`}
        >
          {formatMod(attackBonus - map2)}
        </button>
      </div>
      )}
      
      {/* Save Group */}
      {saveDC && (
        <div className={`flex items-stretch shrink-0 border shadow-sm ${borderBase}`}>
          <div className={`h-6 flex items-center px-2 text-[12px] font-label font-[500] leading-none pt-px ${bgBase} ${textBase}`}>
            <span className="opacity-70 mr-1">Save</span> {saveDC}
          </div>
        </div>
      )}
      
      {/* Damage Group */}
      {damage && (
        <div className={`flex items-stretch shrink-0 border shadow-sm group/container ${borderBase}`}>
          <button 
            onClick={() => rollDamage(name, damage)} 
            className={`group/btn h-6 flex items-center px-1.5 text-[12px] font-label font-[500] leading-none pt-px transition-all cursor-pointer border-r ${bgBase} ${borderMuted} ${textBase} ${bgHover} ${textHover} gap-1`}
          >
            {variant === 'positive' && <span className="material-symbols-outlined text-[14px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)]">keyboard_double_arrow_up</span>}
            {variant === 'negative' && <span className="material-symbols-outlined text-[14px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)]">keyboard_double_arrow_down</span>}
            <SingleD20Icon className="w-4 h-4 group-hover/container:animate-spin [animation-duration:3s] opacity-80 shrink-0 text-primary transition-colors" />
            <span className="opacity-70">Damage</span> {damage}
          </button>
          <button 
            onClick={() => rollDamage(name, damage, true)} 
            className={`group/btn h-6 flex items-center px-2 text-[12px] font-label font-[500] leading-none pt-px transition-all cursor-pointer ${bgBase} ${textBase} shrink-0 ${bgHover} ${textHover}`}
          >
            Critical
          </button>
        </div>
      )}

      {/* Heal Group */}
      {heal && (
        <div className={`flex items-stretch shrink-0 border shadow-sm group/container border-tertiary`}>
          <button 
            onClick={() => rollDamage(name, heal)} 
            className={`group/btn h-6 flex items-center px-1.5 text-[12px] font-label font-[500] leading-none pt-px transition-all cursor-pointer bg-[#12111A] text-secondary hover:bg-[#12111A] hover:ring-1 hover:ring-primary hover:z-10 relative ${textHover} gap-1`}
          >
            <SingleD20Icon className="w-4 h-4 group-hover/container:animate-spin [animation-duration:3s] opacity-80 shrink-0 text-primary transition-colors" />
            <span className="opacity-70">Heal</span> {heal}
          </button>
        </div>
      )}
    </div>
  );
}
