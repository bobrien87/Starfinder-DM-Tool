import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import InlineEditable from './InlineEditable';
import StatPill from './StatPill';
import StrikeActionGroup from './StrikeActionGroup';

export default function InlinePlayerWeapons({ weapons = [], pc, collectionName, entityId, isEditing, formatMod }) {
    const { updateEntity, getEntity, items } = useDatabase();
    const { rollDice, rollDamage } = useDice();
    const [isAdding, setIsAdding] = useState(false);

    const safeWeapons = Array.isArray(weapons) ? weapons : Object.values(weapons || {});

    // Filter available weapons from global items (must have weaponData and not be already equipped)
    const existingIds = safeWeapons.map(w => w.itemId);
    const availableWeapons = (items || [])
        .filter(item => item.weaponData && !existingIds.includes(item.id))
        .sort((a,b) => a.name.localeCompare(b.name));

    const defaultWeaponEntry = (itemId) => ({ 
        itemId, 
        attackBonus: pc.level + (pc.attributes?.dex || 0) // Default guess
    });

    const handleAdd = async (itemId) => {
        setIsAdding(true);
        const newArray = [...safeWeapons, defaultWeaponEntry(itemId)];
        try {
            await updateEntity(collectionName, entityId, { weapons: newArray });
        } catch (err) {
            console.error("Failed to add weapon", err);
        }
        setIsAdding(false);
    };

    const handleRemove = async (indexToRemove) => {
        if (!window.confirm("Remove this weapon?")) return;
        const newArray = safeWeapons.filter((_, i) => i !== indexToRemove);
        try {
            await updateEntity(collectionName, entityId, { weapons: newArray });
        } catch (err) {
            console.error(err);
        }
    };

    const updateWeaponField = async (index, field, value) => {
        const newArray = [...safeWeapons];
        newArray[index] = { ...newArray[index], [field]: value };
        try {
            await updateEntity(collectionName, entityId, { weapons: newArray });
        } catch (err) {
            console.error(err);
        }
    };

    if (!isEditing && safeWeapons.length === 0) {
        return <span className="text-xs text-outline-variant italic">No strikes documented.</span>;
    }

    return (
        <div className="flex flex-col gap-2">
            {safeWeapons.map((weaponEntry, i) => {
                const item = getEntity('items', weaponEntry.itemId);
                if (!item) return null; // Failsafe if item deleted globally
                
                const wData = item.weaponData || { damage: '1d4' };
                const attackBonus = weaponEntry.attackBonus || 0;
                const traits = item.traits || [];
                
                return (
                    <div key={i} className="bg-surface-container-highest p-2.5 px-3 flex flex-wrap 2xl:flex-nowrap items-center gap-3 border-l-2 border-primary/50 group hover:border-primary transition-colors">
                        
                        {/* Left: Name and Traits */}
                        <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-3 flex-grow min-w-[150px]">
                            <span className="font-bold text-sm text-primary uppercase whitespace-nowrap">{item.name}</span>
                            <div className="flex flex-wrap gap-1">
                                {item.traits?.length > 0 ? item.traits.map(t => <StatPill key={t} size="xs">{t}</StatPill>) : <span className="text-[9px] text-outline-variant">NO TRAITS</span>}
                            </div>
                        </div>

                        {/* Right: Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto mt-2 2xl:mt-0 ml-auto">
                            {isEditing ? (
                                <div className="flex items-center gap-1 shrink-0">
                                    <div className="flex items-center text-xs font-bold text-primary py-1 px-1 bg-surface-container border border-primary/30 rounded">
                                        Mod: <InlineEditable type="number" value={attackBonus} collectionName="players" entityId={entityId} isEditing={isEditing} className="ml-1 px-1 !w-6 !min-w-[24px] text-center" onSave={(val) => updateWeaponField(i, 'attackBonus', val)} />
                                    </div>
                                    <button onClick={() => handleRemove(i)} className="text-red-400/50 hover:text-red-400 font-bold text-xs p-1 ml-1 cursor-pointer transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                </div>
                            ) : (
                                <StrikeActionGroup 
                                    name={item.name} 
                                    attackBonus={attackBonus} 
                                    damage={wData?.damage} 
                                    traits={traits} 
                                />
                            )}
                        </div>
                    </div>
                );
            })}

            {isEditing && (
                isAdding ? (
                    <select 
                        autoFocus
                        onChange={(e) => {
                            if (e.target.value) handleAdd(e.target.value);
                            else setIsAdding(false);
                        }}
                        onBlur={() => setIsAdding(false)}
                        className="col-span-full bg-surface-container-highest border-2 border-primary/40 px-4 py-1.5 flex items-center justify-center text-primary font-bold outline-none cursor-pointer mt-2"
                        defaultValue=""
                    >
                        <option value="">Equip a Weapon...</option>
                        {availableWeapons.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </select>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="col-span-full bg-surface-container-highest border-2 border-primary/40 p-2 flex items-center justify-center text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all rounded py-1.5 opacity-60 hover:opacity-100 mt-2">
                        + Equip Weapon
                    </button>
                )
            )}
        </div>
    );
}
