import React, { createContext, useContext, useState } from 'react';

const DiceContext = createContext();

export const useDice = () => useContext(DiceContext);

export function DiceProvider({ children }) {
  const [log, setLog] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const rollDice = (label, modifier, causes = []) => {
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

  const rollDamage = (label, damageString) => {
    // Regex matches formats like "1d6 F" or "2d8+5 E", etc.
    const match = damageString.match(/(\d+)d(\d+)(?:\s*([\+\-])\s*(\d+))?(?:\s+(.*))?/i);
    let total = 0;
    
    if (match) {
        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        const sign = match[3];
        const flatMod = match[4] ? parseInt(match[4], 10) : 0;
        const parsedType = match[5] || '';
        
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
            label,
            notation: damageString,
            dieRolls,
            total,
            parsedType,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev]);

    } else {
        // Fallback for flat numbers or unparseable dice
        setLog(prev => [{
            id: Date.now(),
            type: 'damage',
            label,
            total: damageString,
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
          <div className="w-[340px] h-[400px] mb-4 bg-surface-container-high border-l-2 border-primary shadow-[0_0_20px_rgba(195,245,255,0.15)] flex flex-col pointer-events-auto corner-cut relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
             
             <div className="bg-primary/10 p-4 pb-3 flex justify-between items-center border-b border-outline-variant/30">
               <h3 className="text-primary text-xs tracking-widest uppercase font-black flex items-center gap-2">
                 <span className="material-symbols-outlined text-[16px]">history</span>
                 Roll History
               </h3>
               <button onClick={() => setIsOpen(false)} className="text-secondary hover:text-white transition-colors">
                 <span className="material-symbols-outlined text-[18px]">close</span>
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
               {log.length === 0 ? (
                 <p className="text-xs text-secondary text-center mt-4 uppercase tracking-widest">No rolls yet</p>
               ) : (
                 log.map(roll => {
                   if (roll.type === 'damage') {
                     return (
                       <div key={roll.id} className="bg-surface-container-lowest border-l-2 border-outline-variant/30 p-3 relative corner-cut">
                          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-outline-variant/30 to-transparent"></div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase">{roll.label} Damage</span>
                            <span className="text-[8px] text-secondary">{roll.time}</span>
                          </div>
                          <div className="flex justify-between items-end">
                             <span className="text-xs text-secondary">{roll.notation || roll.total} {roll.dieRolls && `[${roll.dieRolls.join(', ')}]`}</span>
                             <span className="text-2xl font-black font-headline text-primary">{roll.total} <span className="text-xs uppercase">{roll.parsedType}</span></span>
                          </div>
                       </div>
                     );
                   }
                   
                   return (
                     <div key={roll.id} className={`bg-surface-container-lowest border-l-2 p-3 relative corner-cut ${roll.causes && roll.causes.length > 0 ? 'border-error/50' : 'border-primary/50'}`}>
                        <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r to-transparent ${roll.causes && roll.causes.length > 0 ? 'from-error/30' : 'from-primary/30'}`}></div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-[10px] font-bold uppercase ${roll.causes && roll.causes.length > 0 ? 'text-error' : 'text-primary'}`}>{roll.label}</span>
                          <span className="text-[8px] text-secondary">{roll.time}</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                               <span className="text-xs text-secondary">1d20 ({roll.d20}) {roll.modifier >= 0 ? '+' : ''}{roll.modifier}</span>
                               {roll.causes && roll.causes.length > 0 && (
                                   <span className="text-[9px] text-error opacity-70 uppercase tracking-widest mt-0.5">{roll.causes.join(', ')}</span>
                               )}
                           </div>
                           <span className={`text-2xl font-black font-headline ${roll.d20 === 20 ? 'text-[#00ff00] glow-success' : roll.d20 === 1 ? 'text-[#ff0000] glow-error' : 'text-primary'}`}>{roll.total}</span>
                        </div>
                     </div>
                   );
                 })
               )}
             </div>
             <div className="p-2 border-t border-outline-variant/30 text-center">
                <button onClick={() => setLog([])} className="text-[10px] text-secondary hover:text-error uppercase tracking-widest">Clear History</button>
             </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-14 h-14 bg-primary text-[#0d141d] flex items-center justify-center hover:bg-primary/80 transition-all pointer-events-auto shadow-lg rounded-xl"
        >
          <span className="material-symbols-outlined text-[24px]">casino</span>
        </button>
        
      </div>
    </DiceContext.Provider>
  );
}
