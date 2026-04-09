import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import InlineEditable from './InlineEditable';
import InlineTraitValueEditor from './InlineTraitValueEditor';
import StrikeActionGroup from './StrikeActionGroup';
import ActionIcon from './ActionIcon';
import { WEAPON_TRAITS } from '../utils/constants';

export default function InlineCreatureAttacks({ attacks = [], entityId, isEditing, formatMod }) {
    const { updateEntity } = useDatabase();
    const { rollDice, rollDamage } = useDice();
    const [isAdding, setIsAdding] = useState(false);
    
    // Auto-heal logic: If Firebase corrupted the array into a Map { "0": {...} } due to dot-notation bugs
    const safeAttacks = Array.isArray(attacks) ? attacks : Object.values(attacks || {});

    // Default Empty Attack Structure
    const defaultAttack = { weapon: "New Attack", type: "Melee", bonus: 0, damage: "1d4 b", traits: [] };

    const handleAdd = async () => {
        setIsAdding(true);
        const newArray = [...safeAttacks, defaultAttack];
        try {
            await updateEntity('creatures', entityId, { attacks: newArray });
        } catch (err) {
            console.error("Failed to add strike", err);
        }
        setIsAdding(false);
    };

    const handleRemove = async (indexToRemove) => {
        if (!window.confirm("Are you sure you want to delete this strike?")) return;
        const newArray = safeAttacks.filter((_, i) => i !== indexToRemove);
        try {
            await updateEntity('creatures', entityId, { attacks: newArray });
        } catch (err) {
            console.error("Failed to map remove", err);
        }
    };

    const updateAttackField = async (index, field, value) => {
        const newArray = [...safeAttacks];
        newArray[index] = { ...newArray[index], [field]: value };
        try {
            await updateEntity('creatures', entityId, { attacks: newArray });
        } catch (err) {
            console.error("Failed to map array field update", err);
        }
    };

    if (!isEditing && safeAttacks.length === 0) {
        return <span className="text-xs text-outline-variant italic">No strikes documented.</span>;
    }

    return (
        <div className="flex flex-col gap-2">
            {safeAttacks.map((atk, i) => (
                <div key={i} className="bg-surface-container-highest p-2.5 px-3 flex items-center justify-between gap-3 border-l-2 border-primary/50 group hover:border-primary transition-colors min-h-[44px]">
                    
                    {/* Left: Name and Traits */}
                    <div className="flex items-center gap-2 flex-grow min-w-[150px]">
                        <span className="font-bold text-sm text-primary uppercase whitespace-nowrap flex items-center">
                            {isEditing ? (
                                <select 
                                    value={atk.action || "1"} 
                                    onChange={(e) => updateAttackField(i, 'action', e.target.value)}
                                    className="bg-surface-container border border-primary/40 rounded px-1 py-0.5 outline-none focus:border-primary text-xs text-primary cursor-pointer hover:bg-surface-container-high transition-colors appearance-none text-center mr-2 h-6"
                                    title="Action Cost"
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="free">F</option>
                                    <option value="reaction">R</option>
                                    <option value="">-</option>
                                </select>
                            ) : (
                                atk.action && atk.action !== "" ? <ActionIcon action={atk.action} className="h-[1.2em] w-auto inline-block align-middle mr-1.5 text-primary" /> : null
                            )}
                            <InlineEditable value={atk.weapon} collectionName="creatures" entityId={entityId} isEditing={isEditing} onSave={(val) => updateAttackField(i, 'weapon', val)} /> 
                            <span className="text-xs text-secondary opacity-60 normal-case ml-2 flex items-center font-normal">
                                (
                                {isEditing ? (
                                    <select 
                                        value={atk.type || "Melee"} 
                                        onChange={(e) => updateAttackField(i, 'type', e.target.value)}
                                        className="bg-surface-container border-2 border-primary/40 rounded px-2 py-0.5 mx-1 outline-none focus:border-primary text-xs text-primary cursor-pointer hover:bg-surface-container-high transition-colors appearance-none pr-6 relative"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23C3F5FF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.2rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em" }}
                                    >
                                        <option value="Melee">Melee</option>
                                        <option value="Ranged">Ranged</option>
                                    </select>
                                ) : (
                                    atk.type || "Melee"
                                )}
                                )
                            </span>
                        </span>

                        {/* Traits */}
                        <div className="flex flex-wrap gap-1">
                            <InlineTraitValueEditor 
                                values={atk.traits} 
                                collectionName="creatures" 
                                entityId={entityId} 
                                isEditing={isEditing} 
                                options={WEAPON_TRAITS}
                                onSaveValue={(val) => updateAttackField(i, 'traits', val)}
                            />
                        </div>
                    </div>

                    {/* Right: Buttons */}
                    <div className="flex items-center gap-3 shrink-0 ml-4 h-[24px]">
                        {isEditing ? (
                            <div className="flex items-center gap-1 shrink-0">
                                <div className="flex items-center text-xs font-bold text-primary py-1 px-1 bg-surface-container border border-primary/30 rounded">
                                    Atk Bonus: <InlineEditable type="number" value={atk.bonus} collectionName="creatures" entityId={entityId} isEditing={isEditing} className="ml-1 px-1 !w-6 !min-w-[24px] text-center" onSave={(val) => updateAttackField(i, 'bonus', val)} />
                                </div>
                                <div className="text-[10px] text-primary font-bold tracking-widest uppercase border border-primary/40 bg-primary/10 rounded py-1 px-2 shadow-sm shrink-0 flex items-center">
                                    Dmg: <InlineEditable value={atk.damage} collectionName="creatures" entityId={entityId} isEditing={isEditing} className="ml-1 min-w-[40px]" onSave={(val) => updateAttackField(i, 'damage', val)} />
                                </div>
                                <button onClick={() => handleRemove(i)} className="text-red-400/50 hover:text-red-400 font-bold text-xs p-1 ml-1 cursor-pointer transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        ) : (
                            <StrikeActionGroup 
                                name={atk.weapon} 
                                attackBonus={atk.bonus} 
                                damage={atk.damage} 
                                traits={atk.traits} 
                            />
                        )}
                    </div>
                </div>
            ))}
            
            {isEditing && (
                <button onClick={handleAdd} disabled={isAdding} className="col-span-full bg-surface-container-highest border-2 border-primary/40 p-2 flex items-center justify-center text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all rounded py-1.5 opacity-60 hover:opacity-100 mt-2">
                    {isAdding ? 'Adding...' : '+ Add Attack'}
                </button>
            )}
        </div>
    );
}
