import React, { useState, useRef, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useDice } from '../context/DiceContext';
import StatPill from './StatPill';
import BaseComboSelect from './BaseComboSelect';

export default function InlineSkillEditor({ 
  skills = {}, 
  collectionName, 
  entityId, 
  isEditing, 
  options = [],
  formatMod
}) {
  const { updateEntity } = useDatabase();
  const { rollDice } = useDice();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Provide safety net and convert from object dictionary { "Acrobatics": 5 } to array [{type: "Acrobatics", value: 5}]
  const safeSkills = skills || {};
  const skillList = Object.entries(safeSkills).map(([type, rawValue]) => {
    let value = rawValue;
    let delta = 0;
    let causes = [];
    if (typeof rawValue === 'object' && rawValue !== null) {
      value = rawValue.final;
      delta = rawValue.delta;
      causes = rawValue.causes;
    }
    return { type, value, delta, causes };
  });

  // Compute dropdown matches ignoring already added skills
  const filteredAvailable = options.filter(t => 
    t.toLowerCase().includes(inputValue.toLowerCase()) && 
    !(t in safeSkills)
  );

  const handleChange = (newMap) => {
    updateEntity(collectionName, entityId, { skills: newMap });
  };

  const handleSelect = (skillRaw) => {
    // Add skill with default modifier of 0
    handleChange({ ...safeSkills, [skillRaw]: 0 });
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleRemove = (skillType) => {
    const newMap = { ...safeSkills };
    delete newMap[skillType];
    handleChange(newMap);
  };

  const handleValueChange = (skillType, newValue) => {
    const parsed = parseInt(newValue, 10);
    const valToSave = isNaN(parsed) ? 0 : parsed;
    handleChange({ ...safeSkills, [skillType]: valToSave });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && inputValue === '' && skillList.length > 0) {
      // Remove last added skill for fast cleanup
      const lastSkill = skillList[skillList.length - 1].type;
      handleRemove(lastSkill);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val === '') return;

      const exactMatch = filteredAvailable.find(t => t.toLowerCase() === val.toLowerCase());
      if (exactMatch) {
        handleSelect(exactMatch);
      } else {
        if (!(val in safeSkills)) {
          handleSelect(val);
        } else {
          setInputValue('');
        }
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        setInputValue('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [safeSkills]);

  if (!isEditing) {
    if (skillList.length === 0) return <span className="text-xs text-outline-variant italic">No skills documented.</span>;
    return (
      <div className="flex gap-1 flex-wrap">
        {skillList.map(v => (
          <StatPill key={v.type} label={v.type} onClick={() => rollDice(v.type, v.value)}>
            {formatMod(v.value)}
          </StatPill>
        ))}
      </div>
    );
  }

  return (
    <BaseComboSelect
      wrapperRef={wrapperRef}
      isFocused={isFocused}
      onClickWrapper={() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }}
      dropdownContent={isFocused && (filteredAvailable.length > 0 || inputValue.length > 0) ? (
        <>
          {filteredAvailable.length > 0 ? (
            filteredAvailable.map(opt => (
              <div 
                key={opt}
                onClick={() => handleSelect(opt)}
                className="px-3 py-2 text-xs text-primary hover:bg-primary/20 hover:text-primary cursor-pointer border-b tracking-widest font-label border-tertiary/30"
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-outline-variant italic">No exact match in options. (Press Enter to add custom value)</div>
          )}
        </>
      ) : null}
    >
      {skillList.map((skill) => (
        <div key={skill.type} className="inline-flex items-center gap-1">
          <StatPill 
            label={skill.type} 
            className="text-[12px] h-[24px]"
            onClick={() => rollDice(`${skill.type} Check`, skill.value, skill.causes)}
            title={skill.causes?.length > 0 ? skill.causes.join(', ') : null}
            variant={!isEditing ? (skill.delta < 0 ? 'condition-negative' : (skill.delta > 0 ? 'condition-positive' : 'primary')) : 'edit'}
          >
            {formatMod ? (skill.value >= 0 ? `+${skill.value}` : skill.value) : skill.value}
          </StatPill>
          {isEditing && (
            <div className="flex bg-black/40 border border-outline-variant/30 rounded-full h-[24px] overflow-hidden ml-1">
              <input 
                type="number" 
                value={skill.value}
                onChange={(e) => handleValueChange(skill.type, e.target.value)}
                className="w-8 bg-transparent text-center text-off-white text-xs outline-none border-r border-outline-variant/30"
              />
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(skill.type);
                }} 
                className="w-6 flex items-center justify-center text-accent-yellow hover:bg-accent-yellow/20 transition-colors"
                title="Remove"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}
        </div>
      ))}
      
      {isEditing && (
        <input 
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsFocused(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={skillList.length === 0 ? "Add skill..." : ""}
          className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs text-off-white h-6 mt-0.5"
        />
      )}
    </BaseComboSelect>
  );
}
