import React, { useState } from 'react';
import InlineEditable from './InlineEditable';
import HPModal from './HPModal';
import Button from './Button';
import { useDatabase } from '../context/DatabaseContext';
import { getModifiedStat } from '../utils/modifiers';

export default function EncounterInitiativeList({ encounter, selectedTurnId, onSelectTurnId, onNextTurn, onPrevTurn }) {
 const { updateEntity, getEntity } = useDatabase();
 const [editingHpFor, setEditingHpFor] = useState(null);

 React.useEffect(() => {
   if (!encounter?.combatants) return;
   encounter.combatants.forEach(c => {
     const baseDef = getEntity(c.type === 'PC' ? 'players' : 'creatures', c.refId);
     if (!baseDef) return;
     const activeConditions = c.type === 'PC' ? (baseDef.conditions || []) : (c.conditions || []);
     let baseMaxHP = baseDef.hp?.max || 10;
     let dbCurrent = 10;
     
     if (c.type === 'Creature') {
       dbCurrent = c.hp?.current ?? baseMaxHP;
       if (c.hp?.maxOverride) baseMaxHP = c.hp.maxOverride;
     } else {
       dbCurrent = baseDef.hp?.current ?? baseMaxHP;
       if (baseDef.hp?.maxOverride) baseMaxHP = baseDef.hp.maxOverride;
     }
     
     const computedMax = getModifiedStat(baseMaxHP, baseDef, activeConditions, ['max_hp']).final;
     
     if (dbCurrent > computedMax) {
       handleUpdateHP(c.instanceId, { 
          current: computedMax, 
          temp: c.type === 'Creature' ? (c.hp?.temp || 0) : (baseDef.hp?.temp || 0),
          maxOverride: c.type === 'Creature' ? (c.hp?.maxOverride || null) : (baseDef.hp?.maxOverride || null)
       });
     }
   });
 }, [encounter.combatants, getEntity]);

 const combatants = [...(encounter.combatants || [])].sort((a, b) => {
  return (b.initiative || 0) - (a.initiative || 0);
 });

 const handleUpdateInitiative = async (instanceId, newInitiative) => {
   const updated = encounter.combatants.map(c => 
     c.instanceId === instanceId ? { ...c, initiative: Number(newInitiative) } : c
   );
   await updateEntity('encounters', encounter.id, { combatants: updated });
 };

 const handleUpdateHP = async (instanceId, hpData) => {
   const c = encounter.combatants.find(comb => comb.instanceId === instanceId);
   if (!c) return;
   
   if (c.type === 'PC') {
     const baseEntity = getEntity('players', c.refId);
     if (baseEntity) {
       await updateEntity('players', baseEntity.id, { 
         'hp.current': hpData.current,
         'hp.temp': hpData.temp,
         'hp.maxOverride': hpData.maxOverride
       });
     }
   } else {
     const updated = encounter.combatants.map(comb => 
       comb.instanceId === instanceId ? { 
         ...comb, 
         hp: { 
           ...comb.hp, 
           current: hpData.current,
           temp: hpData.temp,
           maxOverride: hpData.maxOverride 
         } 
       } : comb
     );
     await updateEntity('encounters', encounter.id, { combatants: updated });
   }
 };

 return (
  <div className="col-span-3 flex flex-col mt-2">
      <div className="flex justify-between items-center relative h-6">
         <h2 className="m-0 pl-1 tracking-widest uppercase text-primary leading-none self-end">Round {encounter.round || 1}</h2>
         <div className="flex gap-1 items-center absolute right-0 bottom-0">
            <Button variant="secondary" onClick={onPrevTurn} icon="skip_previous" className="!px-2 h-6" title="Previous Turn" />
            <Button variant="primary" onClick={onNextTurn} className="h-6 text-[10px] !px-3">Next Turn</Button>
         </div>
      </div>
      <div className="flex flex-col gap-2 px-1 mt-2">
    {combatants.map((c, i) => {
     const activeIndex = combatants.findIndex(comb => encounter.activeTurnId === comb.instanceId);
     const isActive = encounter.activeTurnId === c.instanceId;
     const isSelected = selectedTurnId === c.instanceId;
     const baseDef = getEntity(c.type === 'PC' ? 'players' : 'creatures', c.refId);
     
     let hpPercent = 100;
     let finalMaxHp = 10;
     let currentHp = 10;
     let tempHp = 0;
     let unOverriddenMax = 10;

     let computedAcValue = 10;
     let isAcModified = false;
     let baseAc = 10;
     let activeConditions = [];

     if (baseDef) {
       activeConditions = c.type === 'PC' ? (baseDef.conditions || []) : (c.conditions || []);
       
       baseAc = baseDef.ac || 10;
       computedAcValue = getModifiedStat(baseAc, baseDef, activeConditions, ['ac']).final;
       isAcModified = computedAcValue !== baseAc;

       let baseMaxHP = baseDef.hp?.max || 10;
       unOverriddenMax = getModifiedStat(baseMaxHP, baseDef, activeConditions, ['max_hp']).final;
       
       if (c.type === 'Creature') {
        currentHp = c.hp?.current ?? baseMaxHP;
        tempHp = c.hp?.temp || 0;
        if (c.hp?.maxOverride) baseMaxHP = c.hp.maxOverride;
       } else {
        currentHp = baseDef.hp?.current ?? baseMaxHP;
        tempHp = baseDef.hp?.temp || 0;
        if (baseDef.hp?.maxOverride) baseMaxHP = baseDef.hp.maxOverride;
       }

       const computedMax = getModifiedStat(baseMaxHP, baseDef, activeConditions, ['max_hp']);
       finalMaxHp = computedMax.final;
       
       if (finalMaxHp > 0) {
         hpPercent = Math.max(0, Math.min(100, (currentHp / finalMaxHp) * 100));
       } else {
         hpPercent = 0;
       }
     }
     
     const isLowHp = hpPercent <= 50;

      const isDead = c.type === 'Creature' && c.hp?.current !== undefined && c.hp.current <= 0;

      const dist = activeIndex !== -1 ? Math.abs(i - activeIndex) : Infinity;

      let computedOpacity = 'opacity-60 hover:opacity-100';
      if (dist === 0 || isSelected || editingHpFor === c.instanceId) {
        computedOpacity = 'opacity-100';
      } else if (dist === 1) {
        computedOpacity = 'opacity-85';
      } else if (dist === 2) {
        computedOpacity = 'opacity-70';
      }

      let iniBorder = '#ef574e80';
      let iniBg = '#12111A';
      if (isActive && isSelected) {
        iniBorder = '#57e6ef';
        iniBg = 'color-mix(in srgb, #12111A, #57e6ef 20%)';
      } else if (isActive) {
        iniBorder = '#ef574e';
        iniBg = 'color-mix(in srgb, #12111A, #ef574e 20%)';
      } else if (isSelected) {
        iniBorder = '#57e6ef';
        iniBg = 'color-mix(in srgb, #12111A, #57e6ef 20%)';
      }
      
      let overlayClasses = editingHpFor === c.instanceId ? 'z-[70]' : isActive ? 'active-glow-pulse z-[60]' : 'z-10';
      let nameColor = isActive ? 'text-primary' : 'text-primary';

      if (isDead) {
        iniBorder = '#313038'; // off-white dark boundary
        iniBg = '#12111A';
        nameColor = 'text-off-white/50';

        if (editingHpFor === c.instanceId) {
          overlayClasses = 'z-[70]'; // Override to baseline full opacity for HP modal editing layer
        } else {
          overlayClasses = 'z-0 grayscale opacity-40 hover:opacity-100'; // Mute out glowing overrides and apply heavy offline baseline fade
        }
      }

       return (
       <div key={c.instanceId} 
        onClick={() => onSelectTurnId?.(c.instanceId)}
        className={`initiative-card flex items-center gap-3 p-3 transition-all duration-300 cursor-pointer text-primary relative ${computedOpacity} ${overlayClasses}`}
        style={{ '--ini-border': iniBorder, '--ini-bg': iniBg }}
       >
        <div className="shrink-0 flex items-center justify-center">
          {isDead ? (
            <div className="w-10 h-10 min-w-[40px] flex items-center justify-center bg-transparent border-2 border-off-white/20 text-off-white/50 rounded-md p-0">
              <span className="material-symbols-outlined text-[20px] [font-variation-settings:'FILL'_1]" data-icon="skull">skull</span>
            </div>
          ) : (
            <InlineEditable 
             value={c.initiative || 0}
             isEditing={true}
             type="number"
             className="!w-10 !h-10 !min-w-[40px] flex items-center justify-center bg-transparent !border-2 !border-primary text-primary rounded-md [box-shadow:0_0_6px_rgba(87,230,239,0.2),inset_0_0_6px_rgba(87,230,239,0.2)] text-base font-[700] font-headline text-center p-0 transition-all duration-200 focus:outline-none hover:[box-shadow:0_0_10px_rgba(87,230,239,0.4),inset_0_0_10px_rgba(87,230,239,0.4)] hover:bg-primary/10 cursor-pointer"
             onSave={(val) => handleUpdateInitiative(c.instanceId, val)}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
         <div className="flex justify-between items-baseline mb-1">
           <div className={`text-[12px] font-label truncate ${nameColor}`} title={c.name}>{c.name}</div>

         </div>
         <div className="h-[6px] w-full overflow-hidden bg-white/10 [clip-path:polygon(0_0,100%_0,100%_calc(100%-3px),calc(100%-3px)_100%,0_100%)]">
         <div className={`h-full bg-secondary ${isLowHp ? 'animate-pulse shadow-[0_0_8px_rgba(239,87,78,0.8)]' : 'opacity-80'}`} style={{ width: `${hpPercent}%` }}></div>
        </div>
       </div>
       
       <div className="w-auto shrink-0 flex flex-col items-end justify-center text-right min-w-[40px] relative">
          <div className="flex items-center gap-[2px] mb-0.5">
            {isAcModified && computedAcValue > baseAc && <span className="material-symbols-outlined text-[12px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)] leading-none pt-px">keyboard_double_arrow_up</span>}
            {isAcModified && computedAcValue < baseAc && <span className="material-symbols-outlined text-[12px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)] leading-none pt-px">keyboard_double_arrow_down</span>}
            <span className="text-[10px] font-label text-primary opacity-60 leading-none" title="Armor Class">AC {computedAcValue}</span>
          </div>
          {(() => {
             const maxIsOverridden = c.type === 'Creature' ? !!c.hp?.maxOverride : !!baseDef?.hp?.maxOverride;
             const displayCurrent = currentHp + tempHp;
             let curColor = 'text-primary';
             if (tempHp > 0) curColor = 'text-accent-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]';
             
             let maxColor = 'text-primary opacity-50';
             if (maxIsOverridden) maxColor = 'text-accent-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] opacity-80';

             return (
               <button 
                  onClick={(e) => { e.stopPropagation(); setEditingHpFor(editingHpFor === c.instanceId ? null : c.instanceId); }}
                  className="flex items-baseline hover:text-white transition-colors cursor-pointer w-full text-right justify-end outline-none"
               >
                 <span className={`text-lg font-label transition-colors ${curColor}`}>{displayCurrent}</span>
                 <span className={`text-lg font-label ml-1 transition-colors ${maxColor}`}>/ {finalMaxHp}</span>
               </button>
             );
          })()}
       </div>

       {editingHpFor === c.instanceId && (
          <HPModal 
            isOpen={true}
            onClose={() => setEditingHpFor(null)}
            combatantName={c.name}
            currentHp={currentHp}
            tempHp={tempHp}
            maxOverride={c.type === 'Creature' ? (c.hp?.maxOverride || null) : (baseDef?.hp?.maxOverride || null)}
            finalMaxHp={unOverriddenMax}
            onSave={(data) => handleUpdateHP(c.instanceId, data)}
          />
       )}
      </div>
     );
    })}

     {combatants.length === 0 && <div className="p-4 text-xs italic text-outline-variant opacity-70">No combatants added.</div>}
   </div>
  </div>
 );
}
