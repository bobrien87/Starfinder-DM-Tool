import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import InlineEditable from './InlineEditable';
import InlineStringArray from './InlineStringArray';
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
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {safeAttacks.map((atk, i) => (
                <div key={i} className="bg-surface-container-highest p-4 flex flex-col justify-between border-l-2 border-primary/50 group hover:border-primary transition-colors">
                    
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-grow">
                            {/* Weapon Name */}
                            <span className="font-bold text-sm text-primary uppercase block">
                                <InlineEditable value={atk.weapon} collectionName="creatures" entityId={entityId} isEditing={isEditing} onSave={(val) => updateAttackField(i, 'weapon', val)} /> 
                                <span className="text-[10px] text-secondary opacity-60 normal-case ml-2">
                                    (<InlineEditable value={atk.type} collectionName="creatures" entityId={entityId} isEditing={isEditing} onSave={(val) => updateAttackField(i, 'type', val)} />)
                                </span>
                            </span>

                            {/* Traits */}
                            <div className="flex flex-wrap gap-1 mt-2 mb-1">
                                <InlineStringArray 
                                    values={atk.traits} 
                                    collectionName="creatures" 
                                    entityId={entityId} 
                                    isEditing={isEditing} 
                                    pillClass="px-1.5 py-[1px] bg-primary/10 text-[9px] font-bold text-primary uppercase"
                                    options={WEAPON_TRAITS}
                                    onSaveValue={(val) => updateAttackField(i, 'traits', val)}
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <button onClick={() => handleRemove(i)} className="text-red-400/50 hover:text-red-400 font-bold text-xs p-1 ml-2 cursor-pointer transition-colors mt-[-4px]">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-outline-variant/10">
                        <div className="flex items-center gap-1 shrink-0 rounded">
                            {/* Bonuses */}
                            {isEditing ? (
                                <div className="flex items-center text-xs font-bold text-primary py-1 px-1 bg-surface-container border border-primary/30 rounded">
                                    Atk Bonus: <InlineEditable type="number" value={atk.bonus} collectionName="creatures" entityId={entityId} isEditing={isEditing} className="ml-1 px-1 w-12 text-center" onSave={(val) => updateAttackField(i, 'bonus', val)} />
                                </div>
                            ) : (
                                <button onClick={() => rollDice(`${atk.weapon} Attack`, atk.bonus)} className="text-xs font-bold text-primary bg-surface border border-primary/50 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer shadow-[0_0_10px_rgba(195,245,255,0.05)] hover:shadow-[0_0_15px_rgba(195,245,255,0.4)] block">{formatMod(atk.bonus)} <span className="text-[9px] font-bold uppercase ml-1">Strike</span></button>
                            )}
                            
                            {!isEditing && (
                                <>
                                    <button onClick={() => rollDice(`${atk.weapon} Attack`, atk.bonus - (atk.traits?.includes('Agile') ? 4 : 5))} className="text-[10px] font-bold text-primary/80 bg-surface border border-primary/30 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer">{formatMod(atk.bonus - (atk.traits?.includes('Agile') ? 4 : 5))}</button>
                                    <button onClick={() => rollDice(`${atk.weapon} Attack`, atk.bonus - (atk.traits?.includes('Agile') ? 8 : 10))} className="text-[10px] font-bold text-secondary bg-surface border border-outline-variant/30 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer">{formatMod(atk.bonus - (atk.traits?.includes('Agile') ? 8 : 10))}</button>
                                </>
                            )}
                        </div>

                        {/* Damage */}
                        {isEditing ? (
                            <div className="text-[10px] text-primary font-bold tracking-widest uppercase border border-primary/40 bg-primary/10 rounded py-1 px-2 shadow-sm ml-auto shrink-0 flex items-center">
                                Dmg: <InlineEditable value={atk.damage} collectionName="creatures" entityId={entityId} isEditing={isEditing} className="ml-1 min-w-[40px]" onSave={(val) => updateAttackField(i, 'damage', val)} />
                            </div>
                        ) : (
                            <button onClick={() => rollDamage(atk.weapon, atk.damage)} className="text-[10px] text-primary font-bold tracking-widest uppercase border border-primary/40 bg-primary/10 rounded py-1 px-2 hover:bg-primary/30 hover:text-white transition-all cursor-pointer shadow-sm ml-auto shrink-0">{atk.damage}</button>
                        )}
                    </div>
                </div>
            ))}
            
            {isEditing && (
                <button onClick={handleAdd} disabled={isAdding} className="bg-surface-container-highest border-2 border-dashed border-primary/40 p-4 flex items-center justify-center text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all rounded opacity-60 hover:opacity-100 min-h-[120px]">
                    {isAdding ? 'Adding...' : '+ Add Target Strike'}
                </button>
            )}
        </div>
    );
}
