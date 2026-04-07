import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import InlineEditable from './InlineEditable';
import { GAME_SKILLS } from '../utils/constants';

export default function InlineSkillMap({ skills = {}, collectionName, entityId, isEditing, formatMod }) {
    const { updateEntity } = useDatabase();
    const { rollDice } = useDice();
    const [isAdding, setIsAdding] = useState(false);

    // Prevent crashing on null states
    const safeSkills = skills || {};
    const availableSkills = GAME_SKILLS.filter(s => !(s in safeSkills));

    const handleAdd = async (skillName) => {
        setIsAdding(true);
        const newMap = { ...safeSkills, [skillName]: 0 }; // Default modifier 0
        try {
            await updateEntity(collectionName, entityId, { skills: newMap });
        } catch (err) {
            console.error("Failed to add skill", err);
        }
        setIsAdding(false);
    };

    const handleRemove = async (skillName) => {
        const newMap = { ...safeSkills };
        delete newMap[skillName];
        try {
            await updateEntity(collectionName, entityId, { skills: newMap });
        } catch (err) {
            console.error("Failed to map remove skill", err);
        }
    };

    const updateSkillVal = async (skillName, val) => {
        const newMap = { ...safeSkills, [skillName]: val };
        try {
            await updateEntity(collectionName, entityId, { skills: newMap });
        } catch (err) {
            console.error("Failed to update derived skill val", err);
        }
    };

    if (!isEditing && Object.keys(safeSkills).length === 0) {
        return <span className="text-xs text-outline-variant italic">No skills documented.</span>;
    }

    return (
        <div className="flex flex-col gap-1">
            {Object.entries(safeSkills).map(([skill, mod]) => (
                <div key={skill} className="zebra-stripe p-2 flex justify-between items-center group">
                    <span className="text-xs font-bold text-primary uppercase flex items-center">
                        {isEditing && (
                            <button onClick={() => handleRemove(skill)} className="text-red-400 hover:text-red-300 font-bold mr-2 text-xs leading-none">
                                ×
                            </button>
                        )}
                        {skill}
                    </span>

                    {isEditing ? (
                        <InlineEditable 
                            type="number" 
                            value={mod} 
                            collectionName={collectionName} 
                            entityId={entityId} 
                            isEditing={isEditing} 
                            className="w-12 px-1 text-center mx-1 font-black text-primary text-sm bg-surface-container border border-primary/30 rounded"
                            onSave={(val) => updateSkillVal(skill, val)}
                        />
                    ) : (
                        <button onClick={() => rollDice(skill, mod)} className="text-sm font-black text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(mod)}</button>
                    )}
                </div>
            ))}

            {isEditing && availableSkills.length > 0 && (
                isAdding ? (
                    <select 
                        autoFocus
                        onChange={(e) => {
                            if (e.target.value) handleAdd(e.target.value);
                            setIsAdding(false);
                        }}
                        onBlur={() => setIsAdding(false)}
                        className="mt-2 w-full p-2 bg-surface border border-primary/40 text-primary text-xs uppercase outline-none"
                    >
                        <option value="">Select a Skill to Add...</option>
                        {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="mt-2 w-full p-2 border-2 border-dashed border-primary/40 text-primary text-xs font-bold uppercase hover:bg-primary/10 transition-colors opacity-70 hover:opacity-100">
                        + Add Skill
                    </button>
                )
            )}
        </div>
    );
}
