import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from './InlineEditable';
import InlineReferenceArray from './InlineReferenceArray';
import InlineTraitValueEditor from './InlineTraitValueEditor';
import ActionIcon from './ActionIcon';
import StrikeActionGroup from './StrikeActionGroup';
import StatPill from './StatPill';
import { ABILITY_TRAITS } from '../utils/constants';
import ParsedDescription from './ParsedDescription';

export default function InlineSpellcastingEditor({ spellcasting = [], collectionName, entityId, entity, isEditing }) {
  const { updateEntity, spells: globalSpells } = useDatabase();
  const [isAdding, setIsAdding] = useState(false);

  // Auto-heal legacy single-object schemas
  let safeCasting = [];
  if (Array.isArray(spellcasting)) {
    safeCasting = spellcasting;
  } else if (spellcasting && typeof spellcasting === 'object') {
    if (Object.keys(spellcasting).length > 0 && !spellcasting.hasOwnProperty('length')) { // Legacy check
      let legacyObj = {
        id: `legacy_sc`,
        name: "Spellcasting",
        tradition: spellcasting.tradition || "Arcane",
        type: spellcasting.type || "Innate",
        ability: "cha",
        dc: spellcasting.dc || 0,
        attack: spellcasting.attack || 0,
        spellsByLevel: {}
      };
      if (Array.isArray(spellcasting.spellSlots)) {
        spellcasting.spellSlots.forEach(slot => {
          legacyObj.spellsByLevel[slot.level] = { slots: slot.slots, spells: slot.spellIds || [] };
        });
      } else if (typeof spellcasting.spellSlots === 'object') {
         legacyObj.spellsByLevel = spellcasting.spellSlots;
      }
      safeCasting = [legacyObj];
    }
  }

  const TRADITIONS = ["Arcane", "Divine", "Primal", "Occult", "Tech", "None"];
  const TYPES = ["Prepared", "Spontaneous", "Innate", "Focus"];
  const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];

  const defaultEntry = {
    id: `sc_${Date.now()}`,
    name: "New Spellcasting",
    tradition: "Arcane",
    type: "Prepared",
    ability: "int",
    proficiency: 1, // Trained
    dc: 0,
    attack: 0,
    spellsByLevel: {
      "0": { slots: 5, spells: [] }
    }
  };

  const handleAddEntry = async () => {
    setIsAdding(true);
    const newArray = [...safeCasting, defaultEntry];
    try {
      await updateEntity(collectionName, entityId, { spellcasting: newArray });
    } catch (err) {
      console.error("Failed to add spellcasting", err);
    }
    setIsAdding(false);
  };

  const handleRemoveEntry = async (indexToRemove) => {
    if (!window.confirm("Remove this entire spellcasting entry?")) return;
    const newArray = safeCasting.filter((_, i) => i !== indexToRemove);
    try {
      await updateEntity(collectionName, entityId, { spellcasting: newArray });
    } catch (err) {
      console.error("Failed", err);
    }
  };

  const updateEntryField = async (entryIndex, field, value) => {
    const newArray = [...safeCasting];
    newArray[entryIndex] = { ...newArray[entryIndex], [field]: value };
    try {
      await updateEntity(collectionName, entityId, { spellcasting: newArray });
    } catch (err) {
      console.error("Failed", err);
    }
  };

  const handleAddLevel = async (entryIndex) => {
    const entry = safeCasting[entryIndex];
    const newLevels = { ...entry.spellsByLevel };
    // Find next lowest missing level (0-10)
    let nextLvl = 1;
    for (let l = 0; l <= 10; l++) {
      if (!newLevels[l]) { nextLvl = l; break; }
    }
    newLevels[nextLvl] = { slots: 3, spells: [] };
    updateEntryField(entryIndex, 'spellsByLevel', newLevels);
  };

  const handleRemoveLevel = async (entryIndex, levelKey) => {
    if (!window.confirm(`Remove spell level ${levelKey}?`)) return;
    const entry = safeCasting[entryIndex];
    const newLevels = { ...entry.spellsByLevel };
    delete newLevels[levelKey];
    updateEntryField(entryIndex, 'spellsByLevel', newLevels);
  };

  const updateLevelField = async (entryIndex, levelKey, field, value) => {
    const entry = safeCasting[entryIndex];
    const newLevels = { ...entry.spellsByLevel };
    newLevels[levelKey] = { ...newLevels[levelKey], [field]: value };
    updateEntryField(entryIndex, 'spellsByLevel', newLevels);
  };

  // Calculate DC/Attack dynamically for PCs, or fallback to overrides
  const getCalculatedStats = (entry) => {
    const isPC = collectionName === 'players';
    if (!isPC || (!entity.level && entity.level !== 0)) {
      return { dc: entry.dc || 10, attack: entry.attack || 0 };
    }
    
    // PC Dynamic Logic
    const mod = Math.floor(((entity.attributes?.[entry.ability] || 10) - 10) / 2); // For raw scores, wait we verified attributes are modifiers like +4
    // Wait, did we verify attributes are modifiers? I checked my previous search: schema says "str: (Number) e.g., +4".
    // Let's use the raw value if it is already a modifier.
    const abilityMod = entity.attributes?.[entry.ability] || 0;
    
    const profBonus = entry.proficiency > 0 ? (entity.level || 0) + (entry.proficiency * 2) : 0;
    
    return {
      dc: 10 + abilityMod + profBonus,
      attack: abilityMod + profBonus
    };
  };

  if (!isEditing && safeCasting.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {safeCasting.map((entry, entryIdx) => {
        const stats = getCalculatedStats(entry);
        const levelsKeys = Object.keys(entry.spellsByLevel || {}).sort((a,b) => Number(a) - Number(b));
        const generatedName = `${entry.tradition !== 'None' ? entry.tradition + ' ' : ''}${entry.type} Spells`.trim();

        const renderCastTime = (castTime) => {
          if (!castTime) return null;
          const lower = castTime.toLowerCase();
          if (lower.includes("1 to 3") || lower.includes("1-3") || lower.includes("1 to 3 actions")) {
            return (
              <span className="flex items-center gap-0.5" title={castTime}>
                <ActionIcon action="1" className="action-icon" />
                <span className="text-[12px] opacity-50 mx-0.5">to</span>
                <ActionIcon action="3" className="action-icon" />
              </span>
            );
          }
          if (lower === "reaction" || lower === "r" || lower.includes("reaction")) return <ActionIcon action="reaction" className="action-icon" />;
          if (lower === "free" || lower === "f" || lower.includes("free")) return <ActionIcon action="free" className="action-icon" />;
          if (lower === "3" || lower.includes("3 action")) return <ActionIcon action="3" className="action-icon" />;
          if (lower === "2" || lower.includes("2 action")) return <ActionIcon action="2" className="action-icon" />;
          if (lower === "1" || lower.includes("1 action")) return <ActionIcon action="1" className="action-icon" />;
     return <span className="text-[12px] text-primary opacity-80">{castTime}</span>;
        };

        if (!isEditing) {
          return (
            <div key={entry.id || entryIdx} className="flex flex-col gap-1 mt-4">
              {/* Block Header */}
              <div className="flex justify-between items-center mb-1">
                <h2 className="truncate m-0 leading-none">
                  {collectionName === 'players' && entry.name ? entry.name : generatedName}
                </h2>
                <div className="flex gap-2 items-center h-6">
                  <div className="flex items-stretch shrink-0 border shadow-sm border-primary/30 h-full">
                    <div className="h-full flex items-center px-2 text-[12px] font-label font-[500] leading-none pt-px bg-[#12111A] text-primary">
                      <span className="opacity-70 mr-1">Spell Attack</span> +{stats.attack}
                    </div>
                  </div>
                  <div className="flex items-stretch shrink-0 border shadow-sm border-primary/30 h-full">
                    <div className="h-full flex items-center px-2 text-[12px] font-label font-[500] leading-none pt-px bg-[#12111A] text-primary">
                      <span className="opacity-70 mr-1">Spell DC</span> {stats.dc}
                    </div>
                  </div>
                </div>
              </div>

              {levelsKeys.filter(lvl => entry.spellsByLevel[lvl]?.spells?.length > 0).map(lvl => {
                const levelData = entry.spellsByLevel[lvl];
                const resolvedSpells = levelData.spells.map(spellId => {
                  const raw = globalSpells.find(s => s.id === spellId || (s.name && s.name.toLowerCase() === spellId.toLowerCase()));
                  if (!raw) return { name: spellId, traits: [], description: "Unmapped Spell. Import spells into the global compendium to view deeply nested spell rules and details.", damage: "", saveMapping: "", saveDegrees: {} };
                  const sys = raw.system || raw.rawFoundryContext?.system || {};
                  if (!raw.system && !raw.rawFoundryContext?.system) return raw; // Pre-mapped or simplistic db structure

                  const flatTraits = (Array.isArray(raw.traits) ? raw.traits : (raw.traits?.value || sys.traits?.value || []))
                    .filter(t => typeof t !== 'string' || t.toLowerCase() !== 'cantrip');
                  
                  let damageStr = raw.damage || "";
                  if (!damageStr && sys.damage) {
                     const dmgParts = Object.values(sys.damage).filter(d => d.formula).map(d => `${d.formula} ${(d.type || d.types?.[0] || d.category || '').toLowerCase()}`.trim());
                     if (dmgParts.length > 0) damageStr = dmgParts.join(' + ');
                  }
                  
                  let attackType = "";
                  if (sys.traits?.value?.includes('attack') || flatTraits.some(t => t.toLowerCase() === 'attack')) {
                     attackType = sys.range?.value ? `Ranged ${sys.range.value}` : "Melee";
                  }

                  let saveMapping = raw.savingThrow || null;
                  if (!saveMapping && sys.defense?.save?.statistic) {
                     saveMapping = `${sys.defense.save.basic ? 'Basic ' : ''}${sys.defense.save.statistic.charAt(0).toUpperCase() + sys.defense.save.statistic.slice(1)}`;
                  }

                  let rawDesc = raw.description || sys.description?.value || "";

                  // Convert generic HTML structural blocks into readable line breaks natively BEFORE extraction
                  rawDesc = rawDesc.replace(/<\/?(p|br|h[1-6]|li|div)[^>]*>/gi, "\n");
                  rawDesc = rawDesc.replace(/\n{3,}/g, '\n\n'); // Collapse massive spacing gaps

                  let extractedHeightened = [];

                  // Extract Native Foundry SF2e Heightened string mappings dynamically!
                  const heightenedMatches = Array.from(rawDesc.matchAll(/<strong>\s*Heightened\s*\(([^)]+)\)\s*<\/strong>([\s\S]*?)(?=<strong>|<hr\s*\/?>|$)/gi));
                  heightenedMatches.forEach(match => {
                      extractedHeightened.push({
                          level: match[1].trim(),
                          text: match[2].replace(/(<([^>]+)>)/gi, "").trim()
                      });
                      rawDesc = rawDesc.replace(match[0], "");
                  });

                  // Extract Degrees of Success mapping dynamically (Critical Success, Success, Failure, Critical Failure)
                  let saveDegreesMap = raw.saveDegrees || {};
                  const successMatches = Array.from(rawDesc.matchAll(/<strong>\s*(Critical Success|Success|Failure|Critical Failure)\s*<\/strong>([\s\S]*?)(?=<strong>|<hr\s*\/?>|$)/gi));
                  successMatches.forEach(match => {
                      const type = match[1].trim(); 
                      const mappedType = type.replace(/\s+(.)/g, (_, c) => c.toUpperCase()); 
                      const key = mappedType.charAt(0).toLowerCase() + mappedType.slice(1);
                      saveDegreesMap[key] = match[2].replace(/(<([^>]+)>)/gi, "").trim();
                      rawDesc = rawDesc.replace(match[0], "");
                  });

                  // Convert structural bold components natively back into our Markdown interpretation layer
                  rawDesc = rawDesc.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
                  rawDesc = rawDesc.replace(/<b>(.*?)<\/b>/gi, "**$1**");

                  // Strip all remaining structural HTML cleanly off the base description
                  rawDesc = rawDesc.replace(/<hr\s*\/?>/gi, "");
                  const finalDesc = rawDesc.replace(/(<([^>]+)>)/gi, "").trim();

                  return {
                     ...raw,
                     description: finalDesc,
                     castTime: raw.castTime || sys.time?.value || "",
                     traits: flatTraits,
                     savingThrow: saveMapping,
                     saveDegrees: Object.keys(saveDegreesMap).length > 0 ? saveDegreesMap : null,
                     damage: damageStr,
                     range: raw.range || sys.range?.value || "",
                     area: raw.area || (sys.area?.value ? `${sys.area.value}-foot ${sys.area.type || 'burst'}` : ""),
                     target: raw.target || sys.target?.value || "",
                     duration: raw.duration || sys.duration?.value || "",
                     isSustained: raw.isSustained || sys.duration?.sustained || false,
                     requirements: raw.requirements || sys.materials?.value || sys.requirements?.value || "",
                     trigger: raw.trigger || sys.trigger?.value || "",
                     attackType: attackType,
                     heightenedBlocks: extractedHeightened,
                     heightened: (raw.heightened && raw.heightened.toLowerCase() !== 'none') ? raw.heightened : null
                  };
                }).filter(Boolean);

                return (
                  <div key={lvl} className="flex flex-col gap-2 mt-4 first:mt-0">
          <div className="shrink-0 flex items-center justify-between gap-2 mb-1">
                      <h3 className="flex items-center gap-3">
                        <span>{lvl === "0" ? "Cantrips" : `Level ${lvl}`}</span>
                        {levelData.slots > 0 && lvl !== "0" && (
                          <span className="opacity-60 normal-case text-[12px] tracking-normal">({levelData.slots} slots)</span>
                        )}
                      </h3>
                      
                      {levelData.slots > 0 && lvl !== "0" && (
                        <div 
                          className="flex items-center gap-1 group py-1 bg-transparent transition-colors" 
                          title="Left click to set filled slots"
                        >
                          {Array.from({ length: levelData.slots }).map((_, i) => {
                            const used = levelData.usedSlots || 0;
                            const isFilled = i < used;
                            return (
                              <div 
                                key={i} 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (isFilled) {
                                    // Remove this filled slot (and any after it)
                                    updateLevelField(entryIdx, lvl, 'usedSlots', i);
                                  } else {
                                    // Fill up to this slot
                                    updateLevelField(entryIdx, lvl, 'usedSlots', i + 1);
                                  }
                                }}
                                className={`w-3 h-3 cursor-pointer border transition-colors ${isFilled ? 'bg-secondary border-secondary/50' : 'bg-transparent hover:border-secondary border-outline-variant/30'}`}
                              ></div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {resolvedSpells.map(spell => (
                        <details key={spell.id} className="group open:mb-2 transition-all">
                          <summary className="accordion-header">
                            <div className="flex flex-wrap items-center gap-2 flex-grow">
                              {renderCastTime(spell.castTime)}
               <span className="text-sm text-off-white whitespace-nowrap font-[500]">{spell.name}</span>
                              {spell.attackType && (
                                <span className="text-[12px] opacity-70 italic font-label">({spell.attackType})</span>
                              )}
                              {spell.traits && spell.traits.length > 0 && (
                                <div className="flex flex-wrap gap-1 ml-2">
                                  <InlineTraitValueEditor 
                                    values={spell.traits || []} 
                                    collectionName="spells" 
                                    entityId={spell.id} 
                                    isEditing={false} 
                                    options={ABILITY_TRAITS} 
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-4 h-[24px]">
                              {(spell.savingThrow || spell.attackType || spell.traits?.includes("Attack") || spell.description?.toLowerCase().includes("attack roll") || spell.damage) ? (
                                <div onClick={(e) => e.preventDefault()} className="shrink-0 flex items-center">
                                  <StrikeActionGroup 
                                    name={spell.name} 
                                    attackBonus={spell.savingThrow ? null : (spell.attackType || spell.traits?.includes("Attack") || spell.description?.toLowerCase().includes("attack roll")) ? stats.attack : null} 
                                    damage={(!spell.traits?.map(t=>t.toLowerCase())?.includes("healing")) ? (spell.damage || "") : ""} 
                                    heal={(spell.traits?.map(t=>t.toLowerCase())?.includes("healing")) ? (spell.damage || "") : null}
                                    traits={spell.traits || []} 
                                    label="Spell" 
                                    saveDC={spell.savingThrow ? `DC ${stats.dc} ${spell.savingThrow}` : null}
                                    theme="primary"
                                  />
                                </div>
                              ) : null}
                              <span className="material-symbols-outlined text-primary opacity-50 group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
                            </div>
                          </summary>
                          <div className="p-4 bg-transparent text-sm text-off-white/90 leading-relaxed font-body flex flex-col gap-2">
                            {(spell.trigger || spell.requirements) && (
                              <div className="flex flex-col gap-1">
                                {spell.trigger && spell.trigger.toLowerCase() !== 'none' && (
                 <div><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline shrink-0 mr-1 uppercase text-[11px] tracking-widest">Trigger</strong> <span className="opacity-80">{spell.trigger}</span></div>
                                )}
                                {spell.requirements && spell.requirements.toLowerCase() !== 'none' && (
                 <div><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline shrink-0 mr-1 uppercase text-[11px] tracking-widest">Requirements</strong> <span className="opacity-80">{spell.requirements}</span></div>
                                )}
                              </div>
                            )}
                            {(spell.range || spell.area || spell.target || spell.duration || spell.isSustained) && (
                              <div className="flex flex-col gap-1">
                                {spell.range && spell.range.toLowerCase() !== 'none' && (
                                  <div><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Range</strong> {spell.range}</div>
                                )}
                                {spell.area && spell.area.toLowerCase() !== 'none' && (
                                  <div><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Area</strong> {spell.area}</div>
                                )}
                                {spell.target && spell.target.toLowerCase() !== 'none' && (
                                  <div><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Target</strong> {spell.target}</div>
                                )}
                                {spell.duration && spell.duration.toLowerCase() !== 'none' && (
                                  <div className="flex items-center gap-1">
                                    <strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline shrink-0">Duration</strong> 
                                    <span>{spell.isSustained ? `Sustained up to ${spell.duration}` : spell.duration}</span>
                                  </div>
                                )}
                                {spell.isSustained && (!spell.duration || spell.duration.toLowerCase() === 'none') && (
                                  <div className="flex items-center gap-1">
                                    <strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline shrink-0">Duration</strong> 
                                    <span>Sustained</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="whitespace-pre-wrap">{spell.description ? <ParsedDescription text={spell.description} /> : <span className="italic opacity-50">No description provided.</span>}</div>
                            
                            {spell.saveDegrees && Object.keys(spell.saveDegrees).length > 0 && (
                              <div className="mt-2 pt-2 border-t flex flex-col gap-1 border-tertiary/30">
                                {spell.saveDegrees.criticalSuccess && <div className="flex"><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Critical Success</strong> <div className="flex-1 whitespace-pre-wrap"><ParsedDescription text={spell.saveDegrees.criticalSuccess} /></div></div>}
                                {spell.saveDegrees.success && <div className="flex"><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Success</strong> <div className="flex-1 whitespace-pre-wrap"><ParsedDescription text={spell.saveDegrees.success} /></div></div>}
                                {spell.saveDegrees.failure && <div className="flex"><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Failure</strong> <div className="flex-1 whitespace-pre-wrap"><ParsedDescription text={spell.saveDegrees.failure} /></div></div>}
                                {spell.saveDegrees.criticalFailure && <div className="flex"><strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline mr-1 shrink-0">Critical Failure</strong> <div className="flex-1 whitespace-pre-wrap"><ParsedDescription text={spell.saveDegrees.criticalFailure} /></div></div>}
                              </div>
                            )}
                            {spell.heightened && spell.heightened.toLowerCase() !== 'none' && (
                              <div className="mt-1 pt-2 border-t border-tertiary/30">
                                <strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline block mb-1">Heightened</strong>
                                {spell.heightened}
                              </div>
                            )}
                            
                            {spell.heightenedBlocks && spell.heightenedBlocks.length > 0 && (
                              <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-tertiary/30">
                                {spell.heightenedBlocks.map((block, idx) => (
                                  <div key={idx} className="flex gap-1">
                                    <strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline whitespace-nowrap shrink-0">
                                      Heightened ({block.level})
                                    </strong> 
                                    <span>{block.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Edit Mode Rendering
        return (
          <div key={entry.id || entryIdx} className="flex flex-col gap-1 mt-4">
            <div className="relative pl-6">
              {/* No Decorative Diamond */}
              
              <div className="p-4 border-l-2 border-primary">
                
                {/* Entry Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
         <span className="text-sm tracking-widest text-primary whitespace-nowrap">
                    {collectionName === 'players' ? (
                      <InlineEditable value={entry.name} collectionName={collectionName} entityId={entityId} isEditing={isEditing} onSave={(val) => updateEntryField(entryIdx, 'name', val)} />
                    ) : (
                      <span>{generatedName}</span>
                    )}
                  </span>
                  
                  <div className="flex items-center gap-2 flex-wrap p-1 px-2 border border-outline-variant/10 rounded">
                    <select value={entry.type || "Prepared"} onChange={e => updateEntryField(entryIdx, 'type', e.target.value)} className="bg-transparent text-xs text-primary outline-none cursor-pointer">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-outline-variant">|</span>
                    <select value={entry.tradition || "Arcane"} onChange={e => updateEntryField(entryIdx, 'tradition', e.target.value)} className="bg-transparent text-xs text-primary outline-none cursor-pointer">
                      {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-outline-variant">|</span>
          <select value={entry.ability || "int"} onChange={e => updateEntryField(entryIdx, 'ability', e.target.value)} className="bg-transparent text-xs text-primary outline-none cursor-pointer ">
                      {ABILITIES.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    {collectionName === 'players' && (
                      <div className="flex items-center px-2 py-0.5 rounded border border-outline-variant/20 text-xs">
                        <span className="text-primary opacity-70 mr-1">Prof:</span>
                        <select value={entry.proficiency || 0} onChange={e => updateEntryField(entryIdx, 'proficiency', parseInt(e.target.value))} className="bg-transparent text-primary outline-none cursor-pointer">
                          <option value={0}>U</option>
                          <option value={1}>T</option>
                          <option value={2}>E</option>
                          <option value={3}>M</option>
                          <option value={4}>L</option>
                        </select>
                      </div>
                    )}

                    <StatPill>
                      Attack: +
                      {collectionName !== 'players' ? (
                        <InlineEditable value={entry.attack} collectionName={collectionName} entityId={entityId} fieldPath={`spellcasting.${entryIdx}.attack`} isEditing={isEditing} type="number" className="w-8 ml-1 text-center rounded" />
                      ) : stats.attack}
                      <span className="mx-1 opacity-50">•</span> DC
                      {collectionName !== 'players' ? (
                        <InlineEditable value={entry.dc} collectionName={collectionName} entityId={entityId} fieldPath={`spellcasting.${entryIdx}.dc`} isEditing={isEditing} type="number" className="w-8 ml-1 text-center rounded" />
                      ) : stats.dc}
                    </StatPill>

                    <button onClick={() => handleRemoveEntry(entryIdx)} className="text-red-400 hover:text-red-300 ml-2">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Spells Body */}
                <div className="flex flex-col gap-3">
                  {levelsKeys.map(lvl => {
                    const levelData = entry.spellsByLevel[lvl];
                    return (
                      <div key={lvl} className="flex flex-col md:flex-row md:items-start lg:items-center gap-2 py-2 group mt-4 first:mt-0">
            <div className="text-[12px] text-primary shrink-0 flex items-center gap-3 w-auto lg:w-48 pt-1 lg:pt-0">
                          <span className="shrink-0 whitespace-nowrap">{lvl === "0" ? "Cantrips" : `Level ${lvl}`}</span>
                          {lvl !== "0" && (
                            <span className="opacity-60 flex items-center normal-case normal-weight tracking-normal whitespace-nowrap">
                              (<InlineEditable type="number" value={levelData.slots} isEditing={true} className="w-6 text-center mx-1 border border-outline-variant/20 rounded" onSave={(val) => updateLevelField(entryIdx, lvl, 'slots', val)} /> Slots)
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 flex-grow">
                          <InlineReferenceArray
                            values={levelData.spells || []}
                            collectionName={collectionName}
                            entityId={entityId}
                            isEditing={isEditing}
                            referenceCollection="spells"
              pillClass="px-2 py-1 border border-outline-variant/20 text-[12px] tracking-wider text-primary "
                            onSaveValue={(newArr) => updateLevelField(entryIdx, lvl, 'spells', newArr)}
                            searchFilter={(spell) => {
                              // Dynamically resolve system bounds for raw Foundry payloads and unmapped imports
                              const sys = spell.system || spell.rawFoundryContext?.system || {};
                              
                              // Resolve Traits
                              const flatTraits = Array.isArray(spell.traits) 
                                ? spell.traits 
                                : (spell.traits?.value || sys.traits?.value || []);
                                
                              const isCantrip = flatTraits.some(t => typeof t === 'string' && t.toLowerCase() === 'cantrip');

                              // Resolve Level
                              let spellLevel = 0;
                              if (!isCantrip) {
                                if (typeof spell.level === 'number') spellLevel = spell.level;
                                else if (spell.level?.value !== undefined) spellLevel = Number(spell.level.value);
                                else if (sys.level?.value !== undefined) spellLevel = Number(sys.level.value);
                              }

                              const targetLvl = Number(lvl);
                              if (spellLevel !== targetLvl) return false;

                              // Resolve Traditions
                              if (entry.tradition && entry.tradition !== 'None') {
                                const target = entry.tradition.toLowerCase();
                                
                                let trads = [];
                                if (Array.isArray(spell.traditions)) trads = spell.traditions;
                                else if (Array.isArray(spell.traits?.traditions)) trads = spell.traits.traditions;
                                else if (Array.isArray(sys.traits?.traditions)) trads = sys.traits.traditions;
                                
                                const mappedTrads = trads.map(t => typeof t === 'string' ? t.toLowerCase() : '');
                                const mappedTraits = flatTraits.map(t => typeof t === 'string' ? t.toLowerCase() : '');
                                
                                if (!mappedTrads.includes(target) && !mappedTraits.includes(target)) return false;
                              }
                              
                              return true;
                            }}
                          />
                        </div>

                        <button onClick={() => handleRemoveLevel(entryIdx, lvl)} className="text-red-400/50 hover:text-red-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer text-[16px] transition-opacity flex items-center">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    );
                  })}

         <button onClick={() => handleAddLevel(entryIdx)} className="text-[12px] text-primary border border-dashed border-primary/30 rounded py-2 mt-2 w-full hover:bg-primary/10 transition-colors">
                    + Add Spell Level Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {isEditing && (
    <button onClick={handleAddEntry} disabled={isAdding} className="border-2 border-primary/40 p-3 flex items-center justify-center text-primary hover:bg-primary/10 hover:border-primary transition-all rounded py-1.5 opacity-60 hover:opacity-100 tracking-widest text-xs">
          {isAdding ? 'Adding...' : '+ Add Spellcasting Entry'}
        </button>
      )}
    </div>
  );
}
