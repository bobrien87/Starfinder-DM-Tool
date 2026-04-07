import React, { useState } from 'react';
import InlineEditable from './InlineEditable';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import { CONDITIONS } from '../data/conditions';
import { getModifiedStat } from '../utils/modifiers';
import ConditionsModal from './ConditionsModal';
import Tooltip from './Tooltip';

function EntityCard({ label, turnId, encounter, isTarget = false }) {
    const { getEntity, updateEntity } = useDatabase();
    const { rollDice, rollDamage } = useDice();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!turnId) return (
        <div className="flex flex-col gap-4 overflow-hidden h-full">
            <h2 className="text-xs font-bold font-label text-secondary opacity-50 uppercase tracking-widest flex items-center gap-2 shrink-0">{label}</h2>
            <div className="bg-surface-container-low border border-outline-variant/10 p-8 h-full flex items-center justify-center text-secondary uppercase font-bold tracking-widest corner-cut opacity-50 text-center">
                Select a combatant
            </div>
        </div>
    );

    const activeCombatant = encounter.combatants?.find(c => c.instanceId === turnId);
    if (!activeCombatant) return <div className="flex flex-col gap-4 overflow-hidden h-full"><div className="bg-surface-container-low p-8 text-secondary italic">Active combatant invalid.</div></div>;

    const baseEntity = getEntity(activeCombatant.type === 'PC' ? 'players' : 'creatures', activeCombatant.refId);
    if (!baseEntity) return <div className="flex flex-col gap-4 overflow-hidden h-full"><div className="bg-surface-container-low p-8 text-error">Failed to load base data.</div></div>;

    const isPC = activeCombatant.type === 'PC';
    
    // Manage Conditions
    const activeConditions = isPC ? (baseEntity.conditions || []) : (activeCombatant.conditions || []);
    
    const handleConditionsUpdate = async (newConditions) => {
        if (isPC) {
            await updateEntity('players', baseEntity.id, { conditions: newConditions });
        } else {
            const newCombatants = encounter.combatants.map(c => 
                c.instanceId === turnId ? { ...c, conditions: newConditions } : c
            );
            await updateEntity('encounters', encounter.id, { combatants: newCombatants });
        }
    };

    const handleAddCondition = (name) => {
        if (!name) return;
        const exists = activeConditions.find(c => c.name === name);
        if (exists && CONDITIONS[name].hasValue) {
            handleConditionsUpdate(activeConditions.map(c => c.name === name ? { ...c, value: c.value + 1 } : c));
        } else if (!exists) {
            handleConditionsUpdate([...activeConditions, { name, value: CONDITIONS[name].hasValue ? 1 : null }]);
        }
    };

    const handleUpdateConditionValue = (name, delta) => {
        const cond = activeConditions.find(c => c.name === name);
        if (!cond) return;
        
        let newArray = [];
        if (cond.value + delta <= 0) {
            newArray = activeConditions.filter(c => c.name !== name);
        } else {
            newArray = activeConditions.map(c => c.name === name ? { ...c, value: c.value + delta } : c);
        }
        handleConditionsUpdate(newArray);
    };

    const handleRemoveCondition = (name) => {
        handleConditionsUpdate(activeConditions.filter(c => c.name !== name));
    };

    // Calculate max hp dynamically (factoring Drained)
    const baseMaxHP = baseEntity.hp?.max || 10;
    const computedMaxHPResult = getModifiedStat(baseMaxHP, baseEntity, activeConditions, ['max_hp']);
    const maxHP = computedMaxHPResult.final;
    const isPenalized = computedMaxHPResult.delta < 0;

    const hpData = isPC ? baseEntity.hp : activeCombatant.hp;
    const currentHP = hpData?.current ?? maxHP;
    const isLowHp = maxHP > 0 && (currentHP / maxHP) <= 0.5;
    const hpPercent = maxHP > 0 ? Math.max(0, Math.min(100, (currentHP / maxHP) * 100)) : 0;
    
    const hpColor = isPenalized ? 'text-error' : (isTarget ? 'text-secondary' : 'text-primary');

    const handleHPSave = async (newVal) => {
        if (isPC) {
            await updateEntity('players', baseEntity.id, { 'hp.current': newVal });
        } else {
            const newCombatants = encounter.combatants.map(c => 
                c.instanceId === turnId ? { ...c, hp: { ...c.hp, current: newVal } } : c
            );
            await updateEntity('encounters', encounter.id, { combatants: newCombatants });
        }
    };

    const formatMod = (num) => num >= 0 ? `+${num}` : num;

    const acRes = getModifiedStat(baseEntity.ac || 10, baseEntity, activeConditions, ['ac', 'all_dcs']);
    const fortRes = getModifiedStat(baseEntity.saves?.fortitude || 0, baseEntity, activeConditions, ['fortitude', 'all_dcs']);
    const refRes = getModifiedStat(baseEntity.saves?.reflex || 0, baseEntity, activeConditions, ['reflex', 'dex_checks', 'all_dcs']);
    const willRes = getModifiedStat(baseEntity.saves?.will || 0, baseEntity, activeConditions, ['will', 'all_dcs']);

    return (
        <div className="flex flex-col gap-4 overflow-hidden h-full">
            <h2 className={`text-xs font-bold font-label uppercase tracking-widest flex items-center gap-2 shrink-0 ${isTarget ? 'text-secondary' : 'text-primary'}`}>
              {label}
            </h2>
            <div className={`corner-cut bg-surface-container-high p-6 border-l-2 relative flex flex-col min-h-0 overflow-y-auto ${isTarget ? 'border-secondary' : 'border-primary'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent ${isTarget ? 'from-secondary/40' : 'from-primary/40'}`}></div>
              
              {/* Header / Traits / HP */}
              <div className="flex justify-between items-start mb-6">
                <div className="min-w-0 pr-4 flex-1">
                  <h3 className={`text-2xl font-black font-headline tracking-tight uppercase leading-none truncate ${isTarget ? 'text-secondary' : 'text-primary'}`}>{activeCombatant.name}</h3>
                  <p className={`text-[10px] font-label tracking-widest uppercase mt-1 mb-2 ${isTarget ? 'text-secondary/60' : 'text-secondary'}`}>Level {baseEntity.level || '?'} • {isPC ? 'Player Character' : 'Creature'}</p>
                  
                  {/* HP Progress Bar */}
                  <div className="w-full h-1.5 bg-surface-container-lowest mb-3 overflow-hidden">
                      <div 
                         className={`h-full transition-all duration-500 ease-out ${isLowHp ? 'bg-error animate-pulse shadow-[0_0_10px_rgba(255,100,100,0.8)]' : isTarget ? 'bg-secondary/60 shadow-[0_0_8px_rgba(42,204,185,0.4)]' : 'bg-primary/60 shadow-[0_0_8px_rgba(255,165,0,0.4)]'}`} 
                         style={{ width: `${hpPercent}%` }}
                      ></div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {baseEntity.traits?.map((t, i) => (
                        <span key={i} className={`px-2 py-0.5 border text-[9px] font-bold font-label uppercase ${isTarget ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-primary/20 border-primary/30 text-primary'}`}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs font-bold font-label uppercase ${hpColor}`}>Current HP</div>
                  <div className={`text-4xl font-black font-headline flex items-baseline gap-1 justify-end ${hpColor}`}>
                      <div className="w-20 inline-block text-right">
                         <InlineEditable 
                            value={currentHP} 
                            isEditing={true} 
                            type="number" 
                            className={`border-none p-1 text-right h-auto leading-none w-full ${hpColor} ${isTarget ? 'bg-secondary/10' : 'bg-primary/10'}`}
                            onSave={handleHPSave}
                         />
                      </div>
                      <span className="text-sm font-normal opacity-50">/ {maxHP}</span>
                  </div>
                  {isPC && <div className={`text-[8px] uppercase mt-1 ${isTarget ? 'text-secondary/40' : 'text-primary/40'}`}>Persists globally</div>}
                  {!isPC && <div className={`text-[8px] uppercase mt-1 ${isTarget ? 'text-secondary/40' : 'text-primary/40'}`}>Instance local</div>}
                </div>
              </div>

               {/* Conditions */}
               <div className="flex justify-between items-end mb-2 mt-4 shrink-0">
                 <div className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest opacity-60">Conditions</div>
                 <button onClick={() => setIsModalOpen(true)} className={`text-[9px] font-bold font-label uppercase flex items-center gap-1 hover:text-white transition-colors ${isTarget ? 'text-secondary pointer-events-none opacity-50' : 'text-primary'}`} disabled={isTarget}>
                    <span className="material-symbols-outlined text-[12px]">add</span> Add Condition
                 </button>
               </div>
               
               <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                 {activeConditions.map((cond, i) => {
                     const def = CONDITIONS[cond.name];
                     return (
                         <Tooltip key={i} content={def?.desc}>
                             <div className={`flex items-center gap-1 px-2 py-1 bg-surface border border-outline-variant/30 corner-cut group`}>
                                <span className={`text-[10px] font-bold font-label uppercase tracking-widest ${def?.isBuff ? 'text-success' : 'text-error'}`}>{cond.name} <span className="opacity-70">{def?.hasValue && cond.value}</span></span>
                                
                                {!isTarget && (
                                    <div className="flex items-center ml-2 border-l border-outline-variant/30 pl-2 pointer-events-auto">
                                        {def?.hasValue && (
                                            <>
                                                <button onClick={() => handleUpdateConditionValue(cond.name, -1)} className="px-1 hover:text-white text-secondary transition-colors font-black text-xs leading-none">-</button>
                                                <button onClick={() => handleUpdateConditionValue(cond.name, 1)} className="px-1 hover:text-white text-secondary transition-colors font-black text-xs leading-none mr-2">+</button>
                                            </>
                                        )}
                                        <button onClick={() => handleRemoveCondition(cond.name)} className="text-secondary/50 hover:text-error transition-colors flex items-center shrink-0">
                                           <span className="material-symbols-outlined text-[12px]" data-icon="close">close</span>
                                        </button>
                                    </div>
                                )}
                             </div>
                         </Tooltip>
                     );
                 })}
                 {activeConditions.length === 0 && (
                     <div className="text-[10px] uppercase font-label text-secondary italic opacity-50">None</div>
                 )}
               </div>

              {/* Defenses */}
              <div className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest opacity-60 mb-2 mt-4 shrink-0">Defences</div>
              <div className="grid grid-cols-1 gap-2 mb-4 shrink-0">
                <div className={`bg-surface-container-highest p-3 flex flex-col items-center border border-outline-variant/10 ${acRes.delta < 0 ? 'border-error/50 bg-error/5' : ''}`}>
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60">Armor Class</span>
                  <span className={`text-xl font-black font-headline ${acRes.delta < 0 ? 'text-error' : isTarget ? 'text-secondary' : 'text-primary'}`} title={acRes.causes.join(', ')}>
                     {acRes.final}
                  </span>
                </div>
              </div>

              {/* Saves */}
              <div className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest opacity-60 mb-2 mt-4 shrink-0">Saves</div>
              <div className="grid grid-cols-3 gap-2 mb-6 shrink-0">
                <div className={`bg-surface-container-highest p-3 flex flex-col items-center border border-outline-variant/10 ${fortRes.delta < 0 ? 'border-error/50 bg-error/5' : ''}`}>
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60">Fortitude</span>
                  <button onClick={() => rollDice(`${activeCombatant.name} Fortitude`, fortRes.final, fortRes.causes)} className={`text-xl font-black font-headline hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer ${fortRes.delta < 0 ? 'text-error' : isTarget ? 'text-secondary' : 'text-primary'}`} title={fortRes.causes.join(', ')}>{formatMod(fortRes.final)}</button>
                </div>
                <div className={`bg-surface-container-highest p-3 flex flex-col items-center border border-outline-variant/10 ${refRes.delta < 0 ? 'border-error/50 bg-error/5' : ''}`}>
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60">Reflex</span>
                  <button onClick={() => rollDice(`${activeCombatant.name} Reflex`, refRes.final, refRes.causes)} className={`text-xl font-black font-headline hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer ${refRes.delta < 0 ? 'text-error' : isTarget ? 'text-secondary' : 'text-primary'}`} title={refRes.causes.join(', ')}>{formatMod(refRes.final)}</button>
                </div>
                <div className={`bg-surface-container-highest p-3 flex flex-col items-center border border-outline-variant/10 ${willRes.delta < 0 ? 'border-error/50 bg-error/5' : ''}`}>
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60">Will</span>
                  <button onClick={() => rollDice(`${activeCombatant.name} Will Save`, willRes.final, willRes.causes)} className={`text-xl font-black font-headline hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer ${willRes.delta < 0 ? 'text-error' : isTarget ? 'text-secondary' : 'text-primary'}`} title={willRes.causes.join(', ')}>{formatMod(willRes.final)}</button>
                </div>
              </div>

              {/* Strikes & Attacks */}
              <div className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest opacity-60 mb-2 mt-4 shrink-0">Strikes / Weapons</div>
              <div className="flex flex-col gap-2 pb-4">
                  {(baseEntity.attacks || baseEntity.weapons || []).map((atk, i) => {
                      const name = atk.weapon || atk.name;
                      const bonus = atk.bonus || atk.attackBonus || 0;
                      const damage = atk.damage || atk.weaponData?.damage || '1d4';
                      const traits = atk.traits || atk.weaponData?.traits || [];
                      const atkRes = getModifiedStat(bonus, baseEntity, activeConditions, ['attack_rolls', 'all_checks', traits.includes('Agile') ? 'agile_attacks' : null, traits.includes('Finesse') ? 'dex_checks' : 'str_checks'].filter(Boolean));
                      const isAtkPenalized = atkRes.delta < 0;

                      return (
                       <div key={i} className={`bg-surface-container-lowest p-3 border-l-2 flex justify-between items-center group shrink-0 ${isAtkPenalized ? 'border-error/50 bg-error/5' : isTarget ? 'border-secondary/50' : 'border-primary/50'}`}>
                        <div className="flex-1 min-w-0 pr-2">
                            <span className={`font-bold text-sm uppercase block truncate ${isAtkPenalized ? 'text-error' : isTarget ? 'text-secondary' : 'text-primary'}`} title={atkRes.causes.join(', ')}>{name}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {traits.map((t, idx) => (
                                    <span key={idx} className={`px-1.5 py-[1px] text-[8px] font-bold uppercase ${isTarget ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => rollDice(`${name} Attack`, atkRes.final, atkRes.causes)} className={`text-xs font-bold bg-surface border border-transparent rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer block ${isAtkPenalized ? 'text-error' : isTarget ? 'text-secondary' : 'text-primary'}`}>{formatMod(atkRes.final)} <span className="text-[9px] font-bold uppercase ml-1">Strike</span></button>
                                <button onClick={() => rollDice(`${name} Attack`, atkRes.final - (traits.includes('Agile') ? 4 : 5), atkRes.causes)} className={`text-[10px] font-bold bg-surface border border-outline-variant/30 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer ${isAtkPenalized ? 'text-error/80' : isTarget ? 'text-secondary/80' : 'text-primary/80'}`}>{formatMod(atkRes.final - (traits.includes('Agile') ? 4 : 5))}</button>
                            </div>
                            <button onClick={() => rollDamage(name, damage)} className={`text-[10px] font-bold tracking-widest uppercase border rounded py-1 px-2 transition-all cursor-pointer shadow-sm min-w-[50px] ${isTarget ? 'text-secondary border-secondary/40 bg-secondary/10 hover:bg-secondary/30 hover:text-white' : 'text-primary border-primary/40 bg-primary/10 hover:bg-primary/30 hover:text-white'}`}>{damage}</button>
                        </div>
                       </div>
                      )
                  })}
              </div>

            </div>
            
            <ConditionsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                activeConditions={activeConditions}
                onAddCondition={handleAddCondition}
            />
        </div>
    );
}

export default function EncounterActiveOverlay({ encounter, selectedTurnId }) {
    return (
        <div className="col-span-9 grid grid-cols-2 gap-6 h-full min-h-0">
           <EntityCard label="Active" turnId={encounter.activeTurnId} encounter={encounter} isTarget={false} />
           <EntityCard label="Selected" turnId={selectedTurnId} encounter={encounter} isTarget={true} />
        </div>
    );
}
