import React, { createContext, useContext, useState } from 'react';
import NavigationIcon from '../components/NavigationIcon';
import SingleD20Icon from '../components/SingleD20Icon';
import diceAudioFile from '../../media/dice_roll.m4a';

const DiceContext = createContext();

export const useDice = () => useContext(DiceContext);

export function DiceProvider({ children }) {
  const [log, setLog] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const playDiceSound = () => {
    try {
      const audio = new Audio(diceAudioFile);
      // allow overlapping sounds for rapid clicks
      audio.play().catch(e => console.log('Silent audio block: ', e));
    } catch (e) {
      // safe fallback if Audio is unavailable
    }
  };

  const rollDice = (label, modifier, causes = []) => {
    playDiceSound();
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + modifier;
    
    setLog(prev => [{
      id: Date.now(),
      type: 'd20',
      label,
      d20,
      modifier,
      total,
      causes,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }, ...prev]);
    
    if (!isOpen) setIsOpen(true);
  };

  const rollDamage = (label, damageString, isCritical = false) => {
    playDiceSound();
    // Regex matches formats like "1d6 F" or "2d8+5 E", etc.
    const match = damageString.match(/(\d+)d(\d+)(?:\s*([\+\-])\s*(\d+))?(?:\s+(.*))?/i);
    let total = 0;
    
    if (match) {
        let count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        const sign = match[3];
        let flatMod = match[4] ? parseInt(match[4], 10) : 0;
        const parsedType = match[5] || '';
        
        if (isCritical) {
            count *= 2;
            flatMod *= 2;
        }

        const dieRolls = [];
        for(let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * sides) + 1;
            dieRolls.push(r);
            total += r;
        }

        if (sign === '+') total += flatMod;
        if (sign === '-') total -= flatMod;

        setLog(prev => [{
            id: Date.now(),
            type: 'damage',
            label: isCritical ? `${label} (Crit)` : label,
            notation: isCritical ? `${damageString} x2` : damageString,
            dieRolls,
            total,
            parsedType,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev]);

    } else {
        // Fallback for flat numbers or unparseable dice
        const flatVal = parseInt(damageString, 10);
        const finalVal = !isNaN(flatVal) && isCritical ? flatVal * 2 : damageString;

        setLog(prev => [{
            id: Date.now(),
            type: 'damage',
            label: isCritical ? `${label} (Crit)` : label,
            total: finalVal,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev]);
    }
    
    if (!isOpen) setIsOpen(true);
  };

  return (
    <DiceContext.Provider value={{ rollDice, rollDamage }}>
      {children}
      
      {/* DICE LOG OVERLAY */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
        
        {/* Chat Modal */}
        {isOpen && (
          <div className="w-[340px] h-[400px] mb-4 border border-tertiary bg-gradient-to-b from-[#2E181B] to-[#0D1216] shadow-2xl flex flex-col pointer-events-auto relative overflow-hidden">
             
             
             <div className="px-4 py-2 flex justify-between items-center relative border-b border-tertiary/30 bg-black/20">
               <div className="w-8"></div> {/* Spacer */}
               <h2 className="flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0 pointer-events-none text-base">
                 Roll History
               </h2>
               <button onClick={() => setIsOpen(false)} className="text-primary hover:text-white transition-colors w-8 h-8 flex items-center justify-center">
                 <span className="material-symbols-outlined text-[18px]">close</span>
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
               {log.length === 0 ? (
         <p className="text-xs text-off-white text-center mt-4 tracking-widest">No rolls yet</p>
               ) : (
                 log.map(roll => {
                   if (roll.type === 'damage') {
                     return (
                       <div key={roll.id} className="border border-tertiary/50 bg-black/40 p-3 relative">
                          
                          <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-bold text-primary ">{roll.label} Damage</span>
                            <span className="text-[8px] text-primary">{roll.time}</span>
                          </div>
                          <div className="flex justify-between items-end">
                             <span className="text-xs text-primary">{roll.notation || roll.total} {roll.dieRolls && `[${roll.dieRolls.join(', ')}]`}</span>
               <span className="text-2xl font-black font-headline text-primary">{roll.total} <span className="text-xs ">{roll.parsedType}</span></span>
                          </div>
                       </div>
                     );
                   }
                   
                   return (
                     <div key={roll.id} className={`border p-3 relative bg-black/40 ${roll.causes && roll.causes.length > 0 ? 'border-accent-yellow/50' : 'border-tertiary/50'}`}>
                        <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r to-transparent ${roll.causes && roll.causes.length > 0 ? 'from-accent-yellow/30' : 'from-primary/30'}`}></div>
                        <div className="flex justify-between items-center mb-2">
             <span className={`text-[12px] font-bold ${roll.causes && roll.causes.length > 0 ? 'text-accent-yellow' : 'text-primary'}`}>{roll.label}</span>
                          <span className="text-[8px] text-primary">{roll.time}</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                               <span className="text-xs text-primary">1d20 ({roll.d20}) {roll.modifier >= 0 ? '+' : ''}{roll.modifier}</span>
                               {roll.causes && roll.causes.length > 0 && (
                  <span className="text-[9px] text-accent-yellow opacity-70 tracking-widest mt-0.5">{roll.causes.join(', ')}</span>
                               )}
                           </div>
                           <span className={`text-2xl font-black font-headline ${roll.d20 === 20 ? 'text-[#00ff00] glow-success' : roll.d20 === 1 ? 'text-[#ff0000] glow-accent-yellow' : 'text-primary'}`}>{roll.total}</span>
                        </div>
                     </div>
                   );
                 })
               )}
             </div>
             <div className="p-2 border-t text-center border-tertiary/30">
        <button onClick={() => setLog([])} className="text-[12px] text-secondary hover:text-primary transition-colors tracking-widest uppercase">Clear History</button>
             </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <NavigationIcon 
          icon={<SingleD20Icon className="w-6 h-6 text-primary" />} 
          onClick={() => setIsOpen(!isOpen)} 
          className="pointer-events-auto mt-2" 
        />
        
      </div>
    </DiceContext.Provider>
  );
}
