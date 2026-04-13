import React, { useState } from 'react';
import InlineEditable from './InlineEditable';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import { CONDITIONS } from '../data/conditions';
import { getModifiedStat } from '../utils/modifiers';
import ConditionsModal from './ConditionsModal';
import EffectsModal from './EffectsModal';
import ActionIcon from './ActionIcon';
import Tooltip from './Tooltip';
import StatPill from './StatPill';
import StrikeActionGroup from './StrikeActionGroup';
import SingleD20Icon from './SingleD20Icon';
import EntityLevelBadge from './EntityLevelBadge';

// New Imports for Full Statblock
import StatCard from './StatCard';
import StatList from './StatList';
import InlineStringArray from './InlineStringArray';
import InlineImmunityEditor from './InlineImmunityEditor';
import InlineResistanceEditor from './InlineResistanceEditor';
import InlineSenseEditor from './InlineSenseEditor';
import InlineSkillEditor from './InlineSkillEditor';
import InlineTraitSelectEditor from './InlineTraitSelectEditor';
import InlineCreatureAttacks from './InlineCreatureAttacks';
import InlineCreatureAbilities from './InlineCreatureAbilities';
import InlineSpellcastingEditor from './InlineSpellcastingEditor';
import InlinePlayerWeapons from './InlinePlayerWeapons';
import InlinePlayerInventory from './InlinePlayerInventory';
import InlineReferenceArray from './InlineReferenceArray';
import { IMMUNITY_OPTIONS, RESISTANCE_WEAKNESS_OPTIONS } from '../data/defenses';
import { SENSES, LANGUAGES } from '../data/traits';
import { GAME_SKILLS } from '../utils/constants';

function EntityCard({ label, turnId, encounter, isTarget = false }) {
  const { getEntity, updateEntity, spells } = useDatabase();
  const { rollDice, rollDamage } = useDice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);

  if (!turnId) return (
    <div className="flex flex-col gap-4 overflow-hidden h-full">
         <div className="border border-outline-variant/10 p-8 h-full flex items-center justify-center corner-cut opacity-50 text-center">
        <h2>Select a combatant</h2>
      </div>
    </div>
  );

  const activeCombatant = encounter.combatants?.find(c => c.instanceId === turnId);
  if (!activeCombatant) return <div className="flex flex-col gap-4 overflow-hidden h-full"><div className="p-8 text-primary italic">Active combatant invalid.</div></div>;

  const baseEntity = getEntity(activeCombatant.type === 'PC' ? 'players' : 'creatures', activeCombatant.refId);
  if (!baseEntity) return <div className="flex flex-col gap-4 overflow-hidden h-full"><div className="p-8 text-accent-yellow">Failed to load base data.</div></div>;

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

  // Manage Effects
  const activeEffects = isPC ? (baseEntity.effects || []) : (activeCombatant.effects || []);
  
  const handleEffectsUpdate = async (newEffects) => {
    if (isPC) {
      await updateEntity('players', baseEntity.id, { effects: newEffects });
    } else {
      const newCombatants = encounter.combatants.map(c => 
        c.instanceId === turnId ? { ...c, effects: newEffects } : c
      );
      await updateEntity('encounters', encounter.id, { combatants: newCombatants });
    }
  };

  const handleAddEffect = (name) => {
    if (!name) return;
    const exists = activeEffects.find(e => e.name === name);
    if (!exists) {
      handleEffectsUpdate([...activeEffects, { name, value: 1 }]);
    }
  };

  const handleUpdateEffectValue = (name, delta) => {
    const eff = activeEffects.find(e => e.name === name);
    if (!eff) return;
    const startValue = eff.value === null ? 1 : eff.value;
    const newValue = startValue + delta;
    
    if (newValue <= 0) {
      handleRemoveEffect(name);
    } else {
      handleEffectsUpdate(activeEffects.map(e => e.name === name ? { ...e, value: newValue } : e));
    }
  };

  const handleRemoveEffect = (name) => {
    handleEffectsUpdate(activeEffects.filter(e => e.name !== name));
  };

  // Build dynamic effects dictionary
  
  const allCombatantData = (encounter.combatants || []).map(c => getEntity(c.type === 'PC' ? 'players' : 'creatures', c.refId)).filter(Boolean);
  const availableEffectsMap = new Map();

  allCombatantData.forEach(d => {
    // Collect all elements that strictly represent Activatable actions or explicit spells
    const activatableElements = [
      ...(d.actions || []),
      ...(d.spellcasting || []).flatMap(entry => 
        Object.values(entry.spellsByLevel || {}).flatMap(levelData => levelData.spells || [])
      ).map(s => {
          if (typeof s === 'string') {
             return spells.find(sp => sp.id === s || (sp.name && sp.name.toLowerCase() === s.toLowerCase()));
          }
          return s;
      }),
      // We explicitly skip `feats` and `passives` to prevent persistent intrinsic effects from cluttering the dynamic badge list!
    ].filter(Boolean);

    activatableElements.forEach(item => {
        // Safe access to the deeply mapped structural relationship graph
        const linkedEffects = item.relationships?.effects || [];
        
        linkedEffects.forEach(effectObj => {
            const { uuid, label } = effectObj;
            if (label) {
               availableEffectsMap.set(label.toLowerCase(), { name: label, desc: `Effect link securely generated via underlying Entity Relationship graph.` });
            }
        });
    });
  });

  const availableEffects = Array.from(availableEffectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Calculate max hp dynamically (factoring Drained)
  const baseMaxHP = baseEntity.hp?.max || 10;
  const computedMaxHPResult = getModifiedStat(baseMaxHP, baseEntity, activeConditions, ['max_hp']);
  const maxHP = computedMaxHPResult.final;
  const isPenalized = computedMaxHPResult.delta < 0;

  const hpData = isPC ? baseEntity.hp : activeCombatant.hp;
  const currentHP = hpData?.current ?? maxHP;
  const isLowHp = maxHP > 0 && (currentHP / maxHP) <= 0.5;
  const hpPercent = maxHP > 0 ? Math.max(0, Math.min(100, (currentHP / maxHP) * 100)) : 0;
  
  // Core Defenses
  const acRes = getModifiedStat(baseEntity.ac || 10, baseEntity, activeConditions, ['ac', 'all_dcs']);
  const fortRes = getModifiedStat(baseEntity.saves?.fortitude || 0, baseEntity, activeConditions, ['fortitude', 'all_dcs']);
  const refRes = getModifiedStat(baseEntity.saves?.reflex || 0, baseEntity, activeConditions, ['reflex', 'dex_checks', 'all_dcs']);
  const willRes = getModifiedStat(baseEntity.saves?.will || 0, baseEntity, activeConditions, ['will', 'all_dcs']);
  const perceptionRes = getModifiedStat(baseEntity.perception || 0, baseEntity, activeConditions, ['perception', 'wis_checks', 'all_checks']);

  const hpColor = isPenalized ? 'text-accent-yellow' : (isTarget ? 'text-primary' : 'text-primary');

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

  const formatMod = (num) => {
    const n = Number(num);
    return isNaN(n) ? num : n >= 0 ? `+${n}` : n;
  };

  // Precalculate modified skills mapped objects for InlineSkillEditor
  const modifiedSkills = {};
  if (baseEntity.skills) {
    Object.entries(baseEntity.skills).forEach(([skill, val]) => {
      let relatedAttrs = ['all_checks'];
      const lower = skill.toLowerCase();
      if (['acrobatics','stealth','thievery'].includes(lower)) relatedAttrs.push('dex_checks');
      if (['athletics'].includes(lower)) relatedAttrs.push('str_checks');
      if (['arcana','crafting','lore','medicine','occultism','religion','society'].includes(lower)) relatedAttrs.push('int_checks');
      if (['nature','survival'].includes(lower)) relatedAttrs.push('wis_checks');
      if (['deception','diplomacy','intimidation','performance'].includes(lower)) relatedAttrs.push('cha_checks');
      const res = getModifiedStat(val, baseEntity, activeConditions, relatedAttrs);
      modifiedSkills[skill] = { final: res.final, delta: res.delta, causes: res.causes };
    });
  }

  // Precalculate modified attacks array to inject UI styling into InlineCreatureAttacks collapsible headers
  const modifiedAttacks = (baseEntity.attacks || []).map(atk => {
    const bonus = atk.bonus || atk.attackBonus || 0;
    const traits = atk.traits || atk.weaponData?.traits || [];
    
    const isRanged = atk.type?.toLowerCase() === 'ranged' || traits.some(t => t.toLowerCase() === 'thrown' || t.toLowerCase() === 'ranged');
    const isFinesse = traits.some(t => t.toLowerCase() === 'finesse' || t.toLowerCase() === 'operative');
    
    const atkRes = getModifiedStat(bonus, baseEntity, activeConditions, [
      'attack_rolls', 
      'all_checks', 
      traits.some(t => t.toLowerCase() === 'agile') ? 'agile_attacks' : null, 
      (isRanged || isFinesse) ? 'dex_checks' : 'str_checks'
    ].filter(Boolean));
    
    return {
      ...atk,
      bonus: atkRes.final,
      theme: atkRes.delta < 0 ? 'accent-yellow' : undefined,
      causes: atkRes.causes,
      delta: atkRes.delta
    };
  });

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
            
      <div className="w-full flex flex-col relative">
        <div className={`corner-cut px-6 pb-6 pt-0 -2 relative flex flex-col w-full ${isTarget ? '-secondary' : '-primary'}`}>
         
       
       {/* === ROW 1: HEADER & HP === */}
       <div className="flex justify-between items-start mb-6 gap-6">
        <div className="min-w-0 pr-4 flex-1">
         <h2 className={`truncate m-0 leading-none ${isTarget ? 'text-secondary !drop-shadow-none' : ''}`}>
           {activeCombatant.name}
         </h2>
         <div className="flex gap-2 mt-2 items-center flex-wrap">
           {baseEntity.traits?.map((t, i) => {
             const isSize = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'].includes(t.toLowerCase());
             return <StatPill key={i} size="xs" variant={isTarget || isSize ? "secondary" : "primary"}>{t}</StatPill>;
           })}
         </div>
        </div>
        {isPC && (
         <p className={`text-[12px] font-label tracking-widest mt-2 ${isTarget ? 'text-off-white/60' : 'text-off-white'}`}>
              Player Character • {baseEntity.size} {baseEntity.ancestry}
              <span className="ml-4 text-primary ">Hero Points: {baseEntity.heroPoints}</span>
         </p>
        )}
        <EntityLevelBadge level={baseEntity.level} isPC={isPC} />
       </div>

        {/* === ROW 2: CONDITIONS === */}
        <div className="flex flex-wrap items-center gap-2 mb-2 shrink-0 min-h-[26px]">
          <h3 className="mr-2 shrink-0">Conditions</h3>
         {activeConditions.map((cond, i) => {
           const def = CONDITIONS[cond.name];
           const bgClass = 'bg-[#fad23f]';
           const borderClass = 'border-none';
           const textClass = 'text-black font-bold';

           return (
             <Tooltip key={i} content={def?.desc}>
               <div className={`flex items-center shrink-0 shadow-sm group/container h-6 min-w-0 ${bgClass}`}>
                  <div className={`flex items-center px-1.5 text-[12px] font-label leading-none pt-[2px] ${textClass} h-full`}>
                    <span className="drop-shadow-none">{cond.name}</span>
                    {def?.hasValue && <span className="opacity-80 ml-1.5 drop-shadow-none">{cond.value}</span>}
                  </div>
                 
                 {!isTarget && (
                   <div className={`flex items-center h-full`}>
                     <div className="w-[1px] h-[80%] bg-black/20"></div>
                     {def?.hasValue ? (
                       <>
                         <button onClick={() => handleUpdateConditionValue(cond.name, 1)} className={`group/btn px-1.5 flex items-center justify-center transition-colors ${textClass} hover:bg-black/20 h-full`}><span className="relative bottom-[2px] text-[14px] leading-none">+</span></button>
                         <div className="w-[1px] h-[80%] bg-black/20"></div>
                         <button onClick={() => handleUpdateConditionValue(cond.name, -1)} className={`group/btn px-1.5 flex items-center justify-center transition-colors ${textClass} hover:bg-black/20 h-full`}><span className="relative bottom-[2px] text-[16px] leading-none">-</span></button>
                       </>
                     ) : (
                       <button onClick={() => handleRemoveCondition(cond.name)} className={`group/btn px-1.5 flex items-center justify-center transition-colors ${textClass} hover:bg-black/20 h-full`}>
                         <span className="material-symbols-outlined text-[14px]" data-icon="close">close</span>
                       </button>
                     )}
                   </div>
                 )}
               </div>
             </Tooltip>
           );
         })}
          {!isTarget && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center shrink-0 shadow-sm h-6 w-6 bg-[#fad23f] text-black hover:brightness-110 transition-all cursor-pointer" title="Add Condition">
              <span className="relative bottom-[1.5px] text-[16px] font-bold leading-none">+</span>
            </button>
          )}
        </div>

        {/* === ROW 2.5: EFFECTS === */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 shrink-0 min-h-[26px] border-b border-tertiary/30">
          <h3 className="mr-2 shrink-0">Effects</h3>
         {activeEffects.map((eff, i) => {
           const def = availableEffects.find(e => e.name === eff.name);
           const bgClass = 'bg-[#fad23f]';
           const textClass = 'text-black font-bold';

           return (
             <Tooltip key={i} content={def?.desc}>
               <div className={`flex items-center shrink-0 shadow-sm group/container h-6 min-w-0 ${bgClass}`}>
                  <div className={`flex items-center px-1.5 text-[12px] font-label leading-none pt-[2px] ${textClass} h-full`}>
                     <span className="drop-shadow-none">{eff.name}</span>
                   </div>
                  
                  {!isTarget && (
                    <div className={`flex items-center h-full`}>
                      <div className="w-[1px] h-[80%] bg-black/20"></div>
                      <button onClick={() => handleRemoveEffect(eff.name)} className={`group/btn px-1.5 flex items-center justify-center transition-colors ${textClass} hover:bg-black/20 h-full`}>
                        <span className="material-symbols-outlined text-[14px]" data-icon="close">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </Tooltip>
           );
         })}
          {!isTarget && (
            <button onClick={() => setIsEffectsModalOpen(true)} className="flex items-center justify-center shrink-0 shadow-sm h-6 w-6 bg-[#fad23f] text-black font-bold hover:brightness-110 transition-all cursor-pointer" title="Add Effect">
              <span className="relative bottom-[1.5px] text-[16px] leading-none">+</span>
            </button>
          )}
        </div>
        
       {/* === ROW 3: ALL CORE DEFENSES === */}
       <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-tertiary/30">
         <div className="flex flex-wrap items-center gap-2">
           <h3 className="mr-2 shrink-0">Defenses</h3>
           
           <StatPill label="AC" variant={acRes.delta < 0 ? 'condition-negative' : (acRes.delta > 0 ? 'condition-positive' : 'primary')} title={acRes.causes?.join(', ')}>
             {acRes.final}
           </StatPill>

           <StatPill label="Fortitude" onClick={() => rollDice(`${activeCombatant.name} Fortitude`, fortRes.final, fortRes.causes)} variant={fortRes.delta < 0 ? 'condition-negative' : (fortRes.delta > 0 ? 'condition-positive' : 'primary')}>
             {formatMod(fortRes.final)}
           </StatPill>
           
           <StatPill label="Reflex" onClick={() => rollDice(`${activeCombatant.name} Reflex`, refRes.final, refRes.causes)} variant={refRes.delta < 0 ? 'condition-negative' : (refRes.delta > 0 ? 'condition-positive' : 'primary')}>
             {formatMod(refRes.final)}
           </StatPill>
           
           <StatPill label="Will" onClick={() => rollDice(`${activeCombatant.name} Will Save`, willRes.final, willRes.causes)} variant={willRes.delta < 0 ? 'condition-negative' : (willRes.delta > 0 ? 'condition-positive' : 'primary')}>
             {formatMod(willRes.final)}
           </StatPill>
         </div>

         {/* Resistances & Weaknesses */}
         {(baseEntity.immunities?.length > 0 || baseEntity.resistances?.length > 0 || baseEntity.weaknesses?.length > 0) && (
           <div className="flex flex-col gap-2 max-w-full overflow-hidden">
            {baseEntity.immunities?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
               <h3 className="mr-2 shrink-0">Immunities</h3>
               <InlineImmunityEditor values={baseEntity.immunities} isEditing={false} />
              </div>
            )}
            {baseEntity.resistances?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
               <h3 className="mr-2 shrink-0">Resistances</h3>
               <InlineResistanceEditor values={baseEntity.resistances} isEditing={false} variant="resistance" />
              </div>
            )}
            {baseEntity.weaknesses?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
               <h3 className="mr-2 shrink-0">Weaknesses</h3>
               <InlineResistanceEditor values={baseEntity.weaknesses} isEditing={false} variant="weakness" />
              </div>
            )}
           </div>
         )}
       </div>

        {/* === ROW 4: CAPABILITIES === */}
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-tertiary/30">
         {/* Senses */}
         <div className="flex flex-wrap items-center gap-2">
           <h3 className="mr-2 shrink-0">Senses</h3>
           <StatPill label="Perception" onClick={() => rollDice('Perception', perceptionRes.final, perceptionRes.causes)} variant={perceptionRes.delta < 0 ? 'condition-negative' : (perceptionRes.delta > 0 ? 'condition-positive' : 'primary')}>
             {formatMod(perceptionRes.final)}
           </StatPill>
           <InlineSenseEditor values={baseEntity.senses} isEditing={false} hideNone={true} />
         </div>

         {/* Languages */}
         {(baseEntity.languages?.length > 0) && (
           <div className="flex flex-wrap items-center gap-2">
            <h3 className="mr-2 shrink-0">Languages</h3>
            <InlineTraitSelectEditor values={baseEntity.languages} isEditing={false} />
           </div>
         )}

         {/* Skills */}
         {(Object.keys(modifiedSkills).length > 0) && (
           <div className="flex flex-wrap items-center gap-2">
             <h3 className="mr-2 shrink-0">Skills</h3>
             <InlineSkillEditor skills={modifiedSkills} isEditing={false} formatMod={formatMod} />
           </div>
         )}
        </div>

       {/* === ROW 5: STRIKES, WEAPONS & SPELLS === */}
       {isPC && (
         <div className="flex flex-col gap-6 w-full">
           {(baseEntity.weapons && baseEntity.weapons.length > 0) && (
             <div className="flex flex-col gap-1">
               <h3 className="mr-2 shrink-0">Weapons</h3>
               <InlinePlayerWeapons pcId={baseEntity.id} weapons={baseEntity.weapons} isEditing={false} formatMod={formatMod} />
             </div>
           )}
           <InlineSpellcastingEditor spellcasting={baseEntity.spellcasting} collectionName="players" entityId={baseEntity.id} entity={baseEntity} isEditing={false} />
           {(baseEntity.items && baseEntity.items.length > 0) && (
             <div className="flex flex-col gap-1">
               <h3 className="mr-2 shrink-0">Inventory</h3>
               <InlinePlayerInventory pcId={baseEntity.id} items={baseEntity.items} isEditing={false} />
             </div>
           )}
         </div>
       )}

       {!isPC && (
         <div className="flex flex-col gap-6 w-full">
           {/* Strikes */}
           {(modifiedAttacks && modifiedAttacks.length > 0) && (
             <div className="flex flex-col gap-1">
              <h3 className="mr-2 shrink-0">Attacks</h3>
              <InlineCreatureAttacks attacks={modifiedAttacks} entityId={baseEntity.id} isEditing={false} formatMod={formatMod} />
             </div>
           )}

           {/* Actions */}
           {(baseEntity.actions && baseEntity.actions.length > 0) && (
             <div className="flex flex-col gap-1">
               <h3 className="mr-2 shrink-0">Actions</h3>
               <InlineCreatureAbilities abilities={baseEntity.actions} type="action" entityId={baseEntity.id} isEditing={false} />
             </div>
           )}

           {/* Passives */}
           {(baseEntity.passives && baseEntity.passives.length > 0) && (
             <div className="flex flex-col gap-1">
               <h3 className="mr-2 shrink-0">Passives</h3>
               <InlineCreatureAbilities abilities={baseEntity.passives} type="passive" entityId={baseEntity.id} isEditing={false} />
             </div>
           )}

           {/* Spells */}
           <InlineSpellcastingEditor spellcasting={baseEntity.spellcasting} collectionName="creatures" entityId={baseEntity.id} entity={baseEntity} isEditing={false} />
         </div>
       )}

      </div>
      
      <ConditionsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activeConditions={activeConditions}
        onAddCondition={handleAddCondition}
      />
      <EffectsModal 
        isOpen={isEffectsModalOpen} 
        onClose={() => setIsEffectsModalOpen(false)} 
        activeEffects={activeEffects}
        availableEffects={availableEffects}
        onAddEffect={handleAddEffect}
      />
     </div>
    </div>
  );
}

export default function EncounterActiveOverlay({ encounter, selectedTurnId }) {
  return (
    <div className="col-span-9">
      <EntityCard label="Selected" turnId={selectedTurnId} encounter={encounter} isTarget={false} />
    </div>
  );
}
