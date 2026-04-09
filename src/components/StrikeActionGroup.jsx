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

        <g className="group-hover/btn:animate-spin" style={{ transformOrigin: '12px 12px' }}>
            <polygon points="12 2, 21 7, 21 17, 12 22, 3 17, 3 7" mask={`url(#${maskId})`} />
        </g>
        <g transform="translate(18, 0)">
            <g className="group-hover/btn:animate-spin" style={{ transformOrigin: '12px 12px', animationDelay: '100ms' }}>
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
    
    // Theme colors
    const textBase = theme === 'error' ? 'text-error' : theme === 'secondary' ? 'text-secondary' : 'text-primary';
    const textMuted = theme === 'error' ? 'text-error/80' : theme === 'secondary' ? 'text-secondary/80' : 'text-primary/80';
    
    const borderBase = theme === 'error' ? 'border-error/50' : theme === 'secondary' ? 'border-secondary/50' : 'border-primary/50';
    const borderMuted = theme === 'error' ? 'border-error/30' : theme === 'secondary' ? 'border-outline-variant/30' : 'border-primary/30';
    
    const bgHover = theme === 'error' ? 'hover:bg-error/80' : theme === 'secondary' ? 'hover:bg-secondary' : 'hover:bg-primary';
    const bgTint = theme === 'error' ? 'bg-error/10' : theme === 'secondary' ? 'bg-secondary/10' : 'bg-primary/10';

    return (
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            {/* Strike Group */}
            {attackBonus !== undefined && attackBonus !== null && (
                <div className={`flex items-stretch shrink-0 bg-surface border rounded overflow-hidden shadow-sm group/container ${borderBase}`}>
                <button 
                    onClick={() => rollDice(`${name} Attack`, attackBonus, causes)} 
                    className={`h-6 flex items-center px-1.5 text-[9px] font-bold uppercase transition-all cursor-pointer border-r ${borderMuted} ${textBase} ${bgHover} hover:text-black gap-1`}
                >
                    <SingleD20Icon className="w-3.5 h-3.5 group-hover/container:animate-spin opacity-80 shrink-0" />
                    <span className="opacity-70">{label}</span> {formatMod(attackBonus)}
                </button>
                <button 
                    onClick={() => rollDice(`${name} Attack`, attackBonus - map1, causes)} 
                    className={`h-6 flex items-center px-2 text-[9px] font-bold transition-all cursor-pointer border-r ${borderMuted} ${textMuted} ${bgHover} hover:text-black`}
                >
                    {formatMod(attackBonus - map1)}
                </button>
                <button 
                    onClick={() => rollDice(`${name} Attack`, attackBonus - map2, causes)} 
                    className={`h-6 flex items-center px-2 text-[9px] font-bold transition-all cursor-pointer ${textMuted} ${bgHover} hover:text-black`}
                >
                    {formatMod(attackBonus - map2)}
                </button>
            </div>
            )}
            
            {/* Save Group */}
            {saveDC && (
                <div className={`flex items-stretch shrink-0 bg-surface border rounded overflow-hidden shadow-sm ${borderBase}`}>
                    <div className={`h-6 flex items-center px-2 text-[9px] font-bold uppercase ${textBase} ${bgTint}`}>
                        <span className="opacity-70 mr-1">Save</span> {saveDC}
                    </div>
                </div>
            )}
            
            {/* Damage Group */}
            {damage && (
                <div className={`flex items-stretch shrink-0 bg-surface border rounded overflow-hidden shadow-sm group/container ${borderBase}`}>
                    <button 
                        onClick={() => rollDamage(name, damage)} 
                        className={`h-6 flex items-center px-1.5 text-[9px] font-bold uppercase transition-all cursor-pointer border-r ${borderMuted} ${bgTint} ${textBase} ${bgHover} hover:text-black gap-1`}
                    >
                        <SingleD20Icon className="w-3.5 h-3.5 group-hover/container:animate-spin opacity-80 shrink-0" />
                        <span className="opacity-70">Damage</span> {damage}
                    </button>
                    <button 
                        onClick={() => rollDamage(name, damage, true)} 
                        className={`h-6 flex items-center px-2 text-[9px] font-bold uppercase transition-all cursor-pointer bg-error/10 text-error hover:bg-error/80 hover:text-black shrink-0`}
                    >
                        Crit
                    </button>
                </div>
            )}

            {/* Heal Group */}
            {heal && (
                <div className={`flex items-stretch shrink-0 border rounded overflow-hidden shadow-sm group/container border-[#1E3A29]/50`}>
                    <button 
                        onClick={() => rollDamage(name, heal)} 
                        className={`h-6 flex items-center px-1.5 text-[9px] font-bold uppercase transition-all cursor-pointer bg-[#1E3A29] text-[#4ade80] hover:bg-[#4ade80] hover:text-black gap-1`}
                    >
                        <SingleD20Icon className="w-3.5 h-3.5 group-hover/container:animate-spin opacity-80 shrink-0" />
                        <span className="opacity-70">Heal</span> {heal}
                    </button>
                </div>
            )}
        </div>
    );
}
