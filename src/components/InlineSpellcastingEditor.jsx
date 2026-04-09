import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from './InlineEditable';
import InlineReferenceArray from './InlineReferenceArray';
import InlineTraitValueEditor from './InlineTraitValueEditor';
import ActionIcon from './ActionIcon';
import StrikeActionGroup from './StrikeActionGroup';
import StatPill from './StatPill';
import { ABILITY_TRAITS } from '../utils/constants';

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
        return <span className="text-xs text-outline-variant italic">No spellcasting entries.</span>;
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
                                <ActionIcon action="1" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />
                                <span className="text-[10px] opacity-50 mx-0.5">to</span>
                                <ActionIcon action="3" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />
                            </span>
                        );
                    }
                    if (lower.includes("reaction")) return <ActionIcon action="reaction" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />;
                    if (lower.includes("free")) return <ActionIcon action="free" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />;
                    if (lower.includes("3 action")) return <ActionIcon action="3" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />;
                    if (lower.includes("2 action")) return <ActionIcon action="2" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />;
                    if (lower.includes("1 action")) return <ActionIcon action="1" className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />;
                    return <span className="text-[10px] uppercase font-bold text-primary opacity-80">{castTime}</span>;
                };

                if (!isEditing) {
                    return (
                        <div key={entry.id || entryIdx} className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                            {/* Block Header */}
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest">
                                    {collectionName === 'players' && entry.name ? entry.name : generatedName}
                                </h2>
                                <StatPill>
                                    Attack: +{stats.attack} • DC {stats.dc}
                                </StatPill>
                            </div>

                            {levelsKeys.filter(lvl => entry.spellsByLevel[lvl]?.spells?.length > 0).map(lvl => {
                                const levelData = entry.spellsByLevel[lvl];
                                const resolvedSpells = levelData.spells.map(spellId => globalSpells.find(s => s.id === spellId)).filter(Boolean);

                                return (
                                    <div key={lvl} className="flex flex-col gap-2 border-t border-outline-variant/10 pt-4 first:border-0 first:pt-0">
                                        <div className="text-[10px] font-bold text-secondary uppercase shrink-0 flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                {lvl === "0" ? "Cantrips" : `Level ${lvl}`}
                                                {levelData.slots > 0 && lvl !== "0" && (
                                                    <span className="opacity-60 normal-case">({levelData.slots} slots)</span>
                                                )}
                                            </div>
                                            
                                            {levelData.slots > 0 && lvl !== "0" && (
                                                <div 
                                                    className="flex items-center gap-1 cursor-pointer group py-1 bg-transparent transition-colors" 
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        const currentUsed = levelData.usedSlots || 0;
                                                        if (currentUsed < levelData.slots) {
                                                            updateLevelField(entryIdx, lvl, 'usedSlots', currentUsed + 1);
                                                        }
                                                    }}
                                                    onContextMenu={(e) => { 
                                                        e.preventDefault(); 
                                                        const currentUsed = levelData.usedSlots || 0;
                                                        if (currentUsed > 0) {
                                                            updateLevelField(entryIdx, lvl, 'usedSlots', currentUsed - 1);
                                                        }
                                                    }}
                                                    title="Left Click to use slot, Right Click to restore"
                                                >
                                                    {Array.from({ length: levelData.slots }).map((_, i) => {
                                                        const used = levelData.usedSlots || 0;
                                                        const isFilled = i < used;
                                                        return (
                                                            <div key={i} className={`w-3 h-3 border border-primary/50 transition-colors ${isFilled ? 'bg-primary' : 'bg-transparent group-hover:border-primary'}`}></div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            {resolvedSpells.map(spell => (
                                                <details key={spell.id} className="group open:mb-2 transition-all">
                                                    <summary className="bg-surface-container-highest p-2.5 px-3 flex items-center justify-between border-l-2 border-primary/50 hover:border-l-primary transition-colors cursor-pointer list-none select-none group-open:border-b border-b-outline-variant/10 [&::-webkit-details-marker]:hidden min-h-[44px]">
                                                        <div className="flex flex-wrap items-center gap-2 flex-grow">
                                                            {renderCastTime(spell.castTime)}
                                                            <span className="font-bold text-sm text-primary uppercase whitespace-nowrap">{spell.name}</span>
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
                                                            {spell.savingThrow || spell.traits?.includes("Attack") || spell.description?.toLowerCase().includes("attack roll") || spell.damage ? (
                                                                <div onClick={(e) => e.preventDefault()} className="shrink-0 flex items-center">
                                                                    <StrikeActionGroup 
                                                                        name={spell.name} 
                                                                        attackBonus={spell.savingThrow ? null : (spell.traits?.includes("Attack") || spell.description?.toLowerCase().includes("attack roll")) ? stats.attack : null} 
                                                                        damage={(!spell.traits?.map(t=>t.toLowerCase())?.includes("healing")) ? (spell.damage || "") : ""} 
                                                                        heal={(spell.traits?.map(t=>t.toLowerCase())?.includes("healing")) ? (spell.damage || "") : null}
                                                                        traits={spell.traits || []} 
                                                                        label="Spell" 
                                                                        saveDC={spell.savingThrow ? `DC ${stats.dc} ${spell.savingThrow}` : null}
                                                                        theme="primary"
                                                                    />
                                                                </div>
                                                            ) : null}
                                                            <span className="material-symbols-outlined text-secondary opacity-50 group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
                                                        </div>
                                                    </summary>
                                                    <div className="bg-surface p-4 border-l-2 border-primary/50 text-xs text-secondary/90 leading-relaxed font-body flex flex-col gap-2">
                                                        {(spell.trigger || spell.requirements) && (
                                                            <div className="flex flex-col gap-1 border-b border-outline-variant/10 pb-2 mb-1">
                                                                {spell.trigger && spell.trigger.toLowerCase() !== 'none' && (
                                                                    <div><strong className="text-secondary opacity-90 font-bold mr-1 shrink-0 uppercase tracking-widest text-[10px]">Trigger</strong> <span className="opacity-80">{spell.trigger}</span></div>
                                                                )}
                                                                {spell.requirements && spell.requirements.toLowerCase() !== 'none' && (
                                                                    <div><strong className="text-secondary opacity-90 font-bold mr-1 shrink-0 uppercase tracking-widest text-[10px]">Requirements</strong> <span className="opacity-80">{spell.requirements}</span></div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {(spell.range || spell.area || spell.target || spell.duration || spell.isSustained) && (
                                                            <div className="flex flex-col gap-1 border-b border-outline-variant/10 pb-2 mb-1">
                                                                {spell.range && spell.range.toLowerCase() !== 'none' && (
                                                                    <div><strong className="text-primary font-bold mr-1 shrink-0">Range</strong> {spell.range}</div>
                                                                )}
                                                                {spell.area && spell.area.toLowerCase() !== 'none' && (
                                                                    <div><strong className="text-primary font-bold mr-1 shrink-0">Area</strong> {spell.area}</div>
                                                                )}
                                                                {spell.target && spell.target.toLowerCase() !== 'none' && (
                                                                    <div><strong className="text-primary font-bold mr-1 shrink-0">Target</strong> {spell.target}</div>
                                                                )}
                                                                {spell.duration && spell.duration.toLowerCase() !== 'none' && (
                                                                    <div className="flex items-center gap-1"><strong className="text-primary font-bold shrink-0">Duration</strong> {spell.isSustained && <StatPill>Sustained</StatPill>}<span>{spell.duration}</span></div>
                                                                )}
                                                                {spell.isSustained && !spell.duration && (
                                                                    <div className="flex items-center gap-1"><strong className="text-primary font-bold shrink-0">Duration</strong> <StatPill>Sustained</StatPill></div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div>{spell.description || <span className="italic opacity-50">No description provided.</span>}</div>
                                                        
                                                        {spell.saveDegrees && Object.keys(spell.saveDegrees).length > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-outline-variant/10 flex flex-col gap-1">
                                                                {spell.saveDegrees.criticalSuccess && <div><strong className="text-secondary font-bold mr-1">Critical Success</strong> {spell.saveDegrees.criticalSuccess}</div>}
                                                                {spell.saveDegrees.success && <div><strong className="text-secondary font-bold mr-1">Success</strong> {spell.saveDegrees.success}</div>}
                                                                {spell.saveDegrees.failure && <div><strong className="text-secondary font-bold mr-1">Failure</strong> {spell.saveDegrees.failure}</div>}
                                                                {spell.saveDegrees.criticalFailure && <div><strong className="text-secondary font-bold mr-1">Critical Failure</strong> {spell.saveDegrees.criticalFailure}</div>}
                                                            </div>
                                                        )}
                                                        {spell.heightened && spell.heightened.toLowerCase() !== 'none' && (
                                                            <div className="mt-1 pt-2 border-t border-outline-variant/10">
                                                                <strong className="text-primary font-bold block mb-1">Heightened</strong>
                                                                {spell.heightened}
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
                    <div key={entry.id || entryIdx} className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                        <div className="relative pl-6">
                            {/* Decorative Diamond */}
                            <div className="absolute left-0 top-2 w-3 h-3 bg-primary/20 border border-primary/50 rotate-45 transform -translate-x-1/2"></div>
                            
                            <div className="bg-surface-container-highest p-4 border-l-2 border-primary">
                                
                                {/* Entry Header */}
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="font-bold text-sm tracking-widest text-primary uppercase whitespace-nowrap">
                                        {collectionName === 'players' ? (
                                            <InlineEditable value={entry.name} collectionName={collectionName} entityId={entityId} isEditing={isEditing} onSave={(val) => updateEntryField(entryIdx, 'name', val)} />
                                        ) : (
                                            <span>{generatedName}</span>
                                        )}
                                    </span>
                                    
                                    <div className="flex items-center gap-2 flex-wrap bg-surface p-1 px-2 border border-outline-variant/10 rounded">
                                        <select value={entry.type || "Prepared"} onChange={e => updateEntryField(entryIdx, 'type', e.target.value)} className="bg-transparent text-xs text-secondary outline-none cursor-pointer">
                                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <span className="text-outline-variant">|</span>
                                        <select value={entry.tradition || "Arcane"} onChange={e => updateEntryField(entryIdx, 'tradition', e.target.value)} className="bg-transparent text-xs text-secondary outline-none cursor-pointer">
                                            {TRADITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <span className="text-outline-variant">|</span>
                                        <select value={entry.ability || "int"} onChange={e => updateEntryField(entryIdx, 'ability', e.target.value)} className="bg-transparent text-xs text-secondary outline-none cursor-pointer uppercase">
                                            {ABILITIES.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                                        </select>
                                    </div>

                                    <div className="ml-auto flex items-center gap-2 shrink-0">
                                        {collectionName === 'players' && (
                                            <div className="flex items-center bg-surface px-2 py-0.5 rounded border border-outline-variant/20 text-xs">
                                                <span className="text-secondary opacity-70 mr-1">Prof:</span>
                                                <select value={entry.proficiency || 0} onChange={e => updateEntryField(entryIdx, 'proficiency', parseInt(e.target.value))} className="bg-transparent text-primary font-bold outline-none cursor-pointer">
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
                                                <InlineEditable value={entry.attack} collectionName={collectionName} entityId={entityId} fieldPath={`spellcasting.${entryIdx}.attack`} isEditing={isEditing} type="number" className="w-8 ml-1 text-center bg-surface-container rounded" />
                                            ) : stats.attack}
                                            <span className="mx-1 opacity-50">•</span> DC
                                            {collectionName !== 'players' ? (
                                                <InlineEditable value={entry.dc} collectionName={collectionName} entityId={entityId} fieldPath={`spellcasting.${entryIdx}.dc`} isEditing={isEditing} type="number" className="w-8 ml-1 text-center bg-surface-container rounded" />
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
                                            <div key={lvl} className="flex flex-col md:flex-row md:items-start lg:items-center gap-2 py-2 border-t border-outline-variant/10 group">
                                                <div className="text-[10px] font-bold text-secondary uppercase shrink-0 flex items-center gap-1 w-auto lg:w-40 pt-1 lg:pt-0">
                                                    {lvl === "0" ? "Cantrips" : `Level ${lvl}`}
                                                    <span className="opacity-60 flex items-center normal-case normal-weight ml-1">
                                                        (<InlineEditable type="number" value={levelData.slots} isEditing={true} className="w-6 text-center mx-1 bg-surface-container border border-outline-variant/20 rounded" onSave={(val) => updateLevelField(entryIdx, lvl, 'slots', val)} /> Slots)
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 flex-grow">
                                                    <InlineReferenceArray
                                                        values={levelData.spells || []}
                                                        collectionName={collectionName}
                                                        entityId={entityId}
                                                        isEditing={isEditing}
                                                        referenceCollection="spells"
                                                        pillClass="px-2 py-1 bg-surface-container-lowest border border-outline-variant/20 text-[10px] font-bold tracking-wider text-secondary uppercase"
                                                        onSaveValue={(newArr) => updateLevelField(entryIdx, lvl, 'spells', newArr)}
                                                        searchFilter={(spell) => true}
                                                    />
                                                </div>

                                                <button onClick={() => handleRemoveLevel(entryIdx, lvl)} className="text-red-400/50 hover:text-red-400 ml-auto shrink-0 font-bold opacity-0 group-hover:opacity-100 cursor-pointer text-[16px] transition-opacity flex items-center">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        );
                                    })}

                                    <button onClick={() => handleAddLevel(entryIdx)} className="text-[10px] font-bold text-primary uppercase border border-dashed border-primary/30 rounded py-2 mt-2 w-full hover:bg-primary/10 transition-colors">
                                        + Add Spell Level Block
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {isEditing && (
                <button onClick={handleAddEntry} disabled={isAdding} className="bg-surface-container-highest border-2 border-primary/40 p-3 flex items-center justify-center text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all rounded py-1.5 opacity-60 hover:opacity-100 uppercase tracking-widest text-xs">
                    {isAdding ? 'Adding...' : '+ Add Spellcasting Entry'}
                </button>
            )}
        </div>
    );
}
