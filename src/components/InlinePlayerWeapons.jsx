import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import InlineEditable from './InlineEditable';

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
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {safeWeapons.map((weaponEntry, i) => {
                const item = getEntity('items', weaponEntry.itemId);
                if (!item) return null; // Failsafe if item deleted globally
                
                const wData = item.weaponData || { damage: '1d4' };
                const attackBonus = weaponEntry.attackBonus || 0;
                
                return (
                    <div key={i} className="bg-surface-container-highest p-4 flex flex-col justify-between border-l-2 border-primary/50 group hover:border-primary transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-sm text-primary uppercase block">{item.name}</span>
                                <div className="flex flex-wrap gap-1 mt-1 mb-1">
                                    {item.traits?.length > 0 ? item.traits.map(t => <span key={t} className="px-1.5 py-[1px] bg-primary/10 text-[9px] font-bold text-primary uppercase">{t}</span>) : <span className="text-[9px] text-outline-variant">NO TRAITS</span>}
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
                                {isEditing ? (
                                    <div className="flex items-center text-xs font-bold text-primary py-1 px-1 bg-surface-container border border-primary/30 rounded">
                                        Manual Bonus: <InlineEditable type="number" value={attackBonus} collectionName="players" entityId={entityId} isEditing={isEditing} className="ml-1 px-1 w-12 text-center" onSave={(val) => updateWeaponField(i, 'attackBonus', val)} />
                                    </div>
                                ) : (
                                    <button onClick={() => rollDice(`${item.name} Attack`, attackBonus)} className="text-xs font-bold text-primary bg-surface border border-primary/50 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer shadow-[0_0_10px_rgba(195,245,255,0.05)] hover:shadow-[0_0_15px_rgba(195,245,255,0.4)] block">{formatMod(attackBonus)} <span className="text-[9px] font-bold uppercase ml-1">Strike</span></button>
                                )}

                                {!isEditing && (
                                    <>
                                        <button onClick={() => rollDice(`${item.name} Attack`, attackBonus - (item.traits?.includes('Agile') ? 4 : 5))} className="text-[10px] font-bold text-primary/80 bg-surface border border-primary/30 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer">{formatMod(attackBonus - (item.traits?.includes('Agile') ? 4 : 5))}</button>
                                        <button onClick={() => rollDice(`${item.name} Attack`, attackBonus - (item.traits?.includes('Agile') ? 8 : 10))} className="text-[10px] font-bold text-secondary bg-surface border border-outline-variant/30 rounded py-1 px-2 hover:bg-primary hover:text-black transition-all cursor-pointer">{formatMod(attackBonus - (item.traits?.includes('Agile') ? 8 : 10))}</button>
                                    </>
                                )}
                            </div>

                            <button onClick={() => rollDamage(item.name, wData.damage)} className="text-[10px] text-primary font-bold tracking-widest uppercase border border-primary/40 bg-primary/10 rounded py-1 px-2 hover:bg-primary/30 hover:text-white transition-all cursor-pointer shadow-sm ml-auto shrink-0">{wData.damage}</button>
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
                        className="bg-surface-container-highest border-2 border-dashed border-primary/40 px-4 py-2 flex items-center justify-center text-primary font-bold outline-none cursor-pointer min-h-[120px]"
                        defaultValue=""
                    >
                        <option value="">Equip a Weapon...</option>
                        {availableWeapons.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </select>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="bg-surface-container-highest border-2 border-dashed border-primary/40 p-4 flex items-center justify-center text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all rounded py-10 opacity-60 hover:opacity-100 min-h-[120px]">
                        + Equip Weapon
                    </button>
                )
            )}
        </div>
    );
}
