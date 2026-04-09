import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from './InlineEditable';
import InlineEditableTextarea from './InlineEditableTextarea';
import InlineTraitValueEditor from './InlineTraitValueEditor';
import ActionIcon from './ActionIcon';
import StatPill from './StatPill';
import { ABILITY_TRAITS } from '../utils/constants';

export default function InlineCreatureAbilities({ abilities = [], type = "action", entityId, isEditing }) {
    const { updateEntity } = useDatabase();
    const [isAdding, setIsAdding] = useState(false);
    
    // Auto-heal logic in case of Firebase array conversion
    const safeAbilities = Array.isArray(abilities) ? abilities : Object.values(abilities || {});

    const defaultAbility = type === "action" 
        ? { name: "New Action", actionCost: "1", description: "", traits: [] }
        : { name: "New Passive", description: "", traits: [] };

    const fieldPath = type === "action" ? "actions" : "passives";

    const handleAdd = async () => {
        setIsAdding(true);
        const newArray = [...safeAbilities, defaultAbility];
        try {
            await updateEntity('creatures', entityId, { [fieldPath]: newArray });
        } catch (err) {
            console.error("Failed to add ability", err);
        }
        setIsAdding(false);
    };

    const handleRemove = async (indexToRemove) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        const newArray = safeAbilities.filter((_, i) => i !== indexToRemove);
        try {
            await updateEntity('creatures', entityId, { [fieldPath]: newArray });
        } catch (err) {
            console.error("Failed to map remove", err);
        }
    };

    const updateField = async (index, field, value) => {
        const newArray = [...safeAbilities];
        newArray[index] = { ...newArray[index], [field]: value };
        try {
            await updateEntity('creatures', entityId, { [fieldPath]: newArray });
        } catch (err) {
            console.error("Failed to update", err);
        }
    };

    if (!isEditing && safeAbilities.length === 0) {
        return <span className="text-xs text-outline-variant italic">No {fieldPath} documented.</span>;
    }

    return (
        <div className="flex flex-col gap-2">
            {safeAbilities.map((ability, i) => (
                <div key={i}>
                    {isEditing ? (
                        <div className="bg-surface p-4 flex flex-col gap-2 border-l-2 border-primary/50 group hover:border-primary transition-colors">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex flex-wrap items-center gap-2 flex-grow">
                                    {/* Action Cost Selector */}
                                    {type === "action" && (
                                        <select 
                                            value={ability.actionCost || "1"} 
                                            onChange={(e) => updateField(i, 'actionCost', e.target.value)}
                                            className="bg-surface-container border border-primary/40 rounded px-1 py-0.5 outline-none focus:border-primary text-xs text-primary cursor-pointer hover:bg-surface-container-high transition-colors appearance-none text-center h-6 shrink-0"
                                            title="Action Cost"
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="free">F</option>
                                            <option value="reaction">R</option>
                                        </select>
                                    )}

                                    {/* Name */}
                                    <span className="font-bold text-sm text-primary uppercase whitespace-nowrap">
                                        <InlineEditable value={ability.name} collectionName="creatures" entityId={entityId} isEditing={true} className="min-w-[150px]" onSave={(val) => updateField(i, 'name', val)} /> 
                                    </span>
                                    
                                    {/* Traits */}
                                    <div className="flex flex-wrap gap-1 ml-2">
                                        <InlineTraitValueEditor 
                                            values={ability.traits || []} 
                                            collectionName="creatures" 
                                            entityId={entityId} 
                                            isEditing={true} 
                                            options={ABILITY_TRAITS} 
                                            onSaveValue={(val) => updateField(i, 'traits', val)}
                                        />
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button onClick={() => handleRemove(i)} className="text-red-400/50 hover:text-red-400 font-bold text-xs p-1 ml-auto cursor-pointer transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>

                            {/* Description Area */}
                            <div className="text-xs text-secondary/90 leading-relaxed font-body mt-1">
                                 <InlineEditableTextarea
                                    value={ability.description || ""}
                                    className="bg-transparent"
                                    collectionName="creatures"
                                    entityId={entityId}
                                    isEditing={true}
                                    onSave={(val) => updateField(i, 'description', val)}
                                 />
                            </div>
                        </div>
                    ) : (
                        <details className="group open:mb-2 transition-all">
                            <summary className="bg-surface-container-highest p-2.5 px-3 flex items-center justify-between border-l-2 border-primary/50 hover:border-l-primary transition-colors cursor-pointer list-none select-none group-open:border-b border-b-outline-variant/10 [&::-webkit-details-marker]:hidden min-h-[44px]">
                                <div className="flex flex-wrap items-center gap-2 flex-grow">
                                    {type === "action" && ability.actionCost && <ActionIcon action={ability.actionCost} className="h-[1.2em] w-auto inline-block align-middle shrink-0 text-primary" />}
                                    <span className="font-bold text-sm text-primary uppercase whitespace-nowrap">{ability.name}</span>
                                    {ability.traits && ability.traits.length > 0 && (
                                        <div className="flex flex-wrap gap-1 ml-2">
                                            <InlineTraitValueEditor 
                                                values={ability.traits || []} 
                                                collectionName="creatures" 
                                                entityId={entityId} 
                                                isEditing={false} 
                                                options={ABILITY_TRAITS} 
                                            />
                                        </div>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-secondary opacity-50 group-open:rotate-180 transition-transform text-[20px] shrink-0 mt-0.5">expand_more</span>
                            </summary>
                            <div className="bg-surface p-4 border-l-2 border-primary/50 text-xs text-secondary/90 leading-relaxed font-body">
                                {ability.description}
                            </div>
                        </details>
                    )}
                </div>
            ))}
            
            {isEditing && (
                <button onClick={handleAdd} disabled={isAdding} className="bg-surface-container-highest border-2 border-primary/40 p-2 flex items-center justify-center text-primary font-bold hover:bg-primary/10 hover:border-primary transition-all rounded py-1.5 opacity-60 hover:opacity-100 mt-2">
                    {isAdding ? 'Adding...' : `+ Add ${type === 'action' ? 'Action' : 'Passive'}`}
                </button>
            )}
        </div>
    );
}
