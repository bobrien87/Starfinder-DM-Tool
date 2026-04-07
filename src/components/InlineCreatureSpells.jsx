import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from './InlineEditable';
import InlineReferenceArray from './InlineReferenceArray';

export default function InlineCreatureSpells({ spellcasting, entityId, isEditing }) {
    const { updateEntity } = useDatabase();

    if (!spellcasting) return null;

    // Auto-heal array corruption from any lingering dot-notation bugs
    const safeSlots = Array.isArray(spellcasting.spellSlots) 
        ? spellcasting.spellSlots 
        : Object.values(spellcasting.spellSlots || {});

    const handleSlotUpdate = async (index, field, value) => {
        const newSlots = [...safeSlots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        try {
            await updateEntity('creatures', entityId, { "spellcasting.spellSlots": newSlots });
        } catch (err) {
            console.error("Failed to map Spell Slots array update", err);
        }
    };

    const handleAddSlot = async () => {
        const newSlots = [...safeSlots, { level: 1, slots: 3, spellIds: [] }];
        try {
            await updateEntity('creatures', entityId, { "spellcasting.spellSlots": newSlots });
        } catch (err) {
             console.error("Failed to map add slot", err);
        }
    };

    const handleRemoveSlot = async (indexToRemove) => {
        if (!window.confirm("Delete this spell level?")) return;
        const newSlots = safeSlots.filter((_, i) => i !== indexToRemove);
        try {
            await updateEntity('creatures', entityId, { "spellcasting.spellSlots": newSlots });
        } catch (err) {
             console.error("Failed to map remove slot", err);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {safeSlots.map((slot, i) => (
                <div key={`slot-${i}`} className="flex flex-col md:flex-row md:items-start lg:items-center gap-2 py-2 border-t border-outline-variant/10 first:border-0 first:pt-0 group">
                    <span className="text-[10px] font-bold text-secondary uppercase shrink-0 flex items-center gap-1 w-auto lg:w-40 pt-1 lg:pt-0">
                        Level <InlineEditable type="number" value={slot.level} collectionName="creatures" entityId={entityId} isEditing={isEditing} className="w-8 text-center mx-1 bg-surface-container border border-outline-variant/20 rounded" onSave={(val) => handleSlotUpdate(i, 'level', val)} /> 
                        <span className="opacity-60 flex items-center normal-case normal-weight">
                            (<InlineEditable type="number" value={slot.slots} collectionName="creatures" entityId={entityId} isEditing={isEditing} className="w-8 text-center mx-1 bg-surface-container border border-outline-variant/20 rounded" onSave={(val) => handleSlotUpdate(i, 'slots', val)} /> Slots)
                        </span>
                    </span>
                    <div className="flex flex-wrap gap-2 flex-grow">
                        <InlineReferenceArray
                            values={slot.spellIds}
                            collectionName="creatures"
                            entityId={entityId}
                            isEditing={isEditing}
                            referenceCollection="spells"
                            pillClass="px-2 py-1 bg-surface-container-lowest border border-outline-variant/20 text-[10px] font-bold tracking-wider text-secondary uppercase"
                            onSaveValue={(newArr) => handleSlotUpdate(i, 'spellIds', newArr)}
                        />
                    </div>
                    {isEditing && (
                        <button onClick={() => handleRemoveSlot(i)} className="text-red-400 hover:text-red-300 ml-auto shrink-0 font-bold opacity-50 hover:opacity-100 cursor-pointer text-xs">
                            ×
                        </button>
                    )}
                </div>
            ))}

            {isEditing && (
                <button onClick={handleAddSlot} className="text-[10px] font-bold text-primary uppercase border border-dashed border-primary/30 rounded py-2 mt-2 w-full hover:bg-primary/10 transition-colors">
                    + Add Spell Level Block
                </button>
            )}
        </div>
    );
}
