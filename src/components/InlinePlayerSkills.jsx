import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import InlineEditable from './InlineEditable';
import { GAME_SKILLS, PROFICIENCY_COLORS } from '../utils/constants';
import SingleD20Icon from './SingleD20Icon';
import StatPill from './StatPill';

export default function InlinePlayerSkills({ skills = {}, collectionName, entityId, isEditing, formatMod }) {
  const { updateEntity } = useDatabase();
  const { rollDice } = useDice();
  const [isAdding, setIsAdding] = useState(false);

  const safeSkills = skills || {};
  const availableSkills = GAME_SKILLS.filter(s => !(s in safeSkills)).sort();

  const handleAdd = async (skillName) => {
    setIsAdding(true);
    const newMap = { ...safeSkills, [skillName]: { rank: 1, modifier: 0 } };
    try {
      await updateEntity(collectionName, entityId, { skills: newMap });
    } catch (err) {
      console.error("Failed to add skill", err);
    }
    setIsAdding(false);
  };

  const handleRemove = async (skillName) => {
    if (!window.confirm(`Delete ${skillName}?`)) return;
    const newMap = { ...safeSkills };
    delete newMap[skillName];
    try {
      await updateEntity(collectionName, entityId, { skills: newMap });
    } catch (err) {
      console.error(err);
    }
  };

  const updateSkillField = async (skillName, field, val) => {
    const newMap = { ...safeSkills };
    newMap[skillName] = { ...newMap[skillName], [field]: val };
    await updateEntity(collectionName, entityId, { skills: newMap });
  };

  if (!isEditing && Object.keys(safeSkills).length === 0) {
    return <span className="text-xs text-outline-variant italic">No skills documented.</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(safeSkills).map(([skill, data]) => {
        const rankLabels = ['U','T','E','M','L'];
        const rankNum = data?.rank || 0;
        const mod = data?.modifier || 0;

        return (
          <div key={skill} className="zebra-stripe p-2 flex justify-between items-center group">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <select 
                  value={rankNum} 
                  onChange={(e) => updateSkillField(skill, 'rank', parseInt(e.target.value))}
                  className={`w-8 h-6 rounded flex items-center justify-center text-[12px] outline-none border cursor-pointer text-center ${PROFICIENCY_COLORS[rankNum] || PROFICIENCY_COLORS[0]}`}
                >
                  {rankLabels.map((r, i) => <option key={i} value={i} className="text-primary ">{r}</option>)}
                </select>
              ) : (
                <span className={`w-5 h-5 rounded border flex items-center justify-center text-[9px] ${PROFICIENCY_COLORS[rankNum] || PROFICIENCY_COLORS[0]}`}>
                  {rankLabels[rankNum]}
                </span>
              )}
              
              {isEditing && (
        <span className="text-[12px] text-primary flex items-center">
                  <button onClick={() => handleRemove(skill)} className="text-red-400 hover:text-red-300 mr-2 text-[14px] leading-none shrink-0" title="Delete Skill">
                    ×
                  </button>
                  {skill}
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="flex items-center gap-1">
                <InlineEditable 
                  type="number" 
                  value={mod} 
                  collectionName={collectionName} 
                  entityId={entityId} 
                  isEditing={isEditing} 
                  className="w-10 px-1 text-center text-primary text-sm border border-primary/30 rounded"
                  onSave={(val) => updateSkillField(skill, 'modifier', val)}
                />
              </div>
            ) : (
              <StatPill label={skill} onClick={() => rollDice(skill, mod)}>{formatMod(mod)}</StatPill>
            )}
          </div>
        );
      })}

      {isEditing && availableSkills.length > 0 && (
        isAdding ? (
          <select 
            autoFocus
            onChange={(e) => {
              if (e.target.value) handleAdd(e.target.value);
              setIsAdding(false);
            }}
            onBlur={() => setIsAdding(false)}
      className="mt-2 w-full p-2 border border-primary/40 text-primary text-xs outline-none"
          >
            <option value="">Select a Skill to Add...</option>
            {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
     <button onClick={() => setIsAdding(true)} className="mt-2 w-full p-2 border-2 border-dashed border-primary/40 text-primary text-xs hover:bg-primary/10 transition-colors opacity-70 hover:opacity-100">
            + Add Skill
          </button>
        )
      )}
    </div>
  );
}
