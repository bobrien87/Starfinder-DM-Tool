import React from 'react';
import InlineEditable from './InlineEditable';
import { useDatabase } from '../context/DatabaseContext';

export default function EncounterInitiativeList({ encounter, selectedTurnId, onSelectTurnId }) {
  const { updateEntity, getEntity } = useDatabase();

  const combatants = [...(encounter.combatants || [])].sort((a, b) => {
    return (b.initiative || 0) - (a.initiative || 0);
  });

  const handleUpdateInitiative = async (instanceId, newInitiative) => {
      const updated = encounter.combatants.map(c => 
          c.instanceId === instanceId ? { ...c, initiative: Number(newInitiative) } : c
      );
      await updateEntity('encounters', encounter.id, { combatants: updated });
  };

  return (
    <div className="col-span-3 flex flex-col gap-2 h-full min-h-0">
      <h2 className="text-xs font-bold font-label text-primary uppercase tracking-widest mb-2 flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-[16px]" data-icon="format_list_numbered">format_list_numbered</span>
        Initiative Order
      </h2>
      <div className="bg-surface-container-low border border-outline-variant/10 flex-1 overflow-y-auto">
        {combatants.map(c => {
          const isActive = encounter.activeTurnId === c.instanceId;
          const isSelected = selectedTurnId === c.instanceId;
          const baseDef = getEntity(c.type === 'PC' ? 'players' : 'creatures', c.refId);
          
          let hpPercent = 100;
          if (c.type === 'Creature' && c.hp?.max) hpPercent = (c.hp.current / c.hp.max) * 100;
          else if (c.type === 'PC' && baseDef?.hp?.max) hpPercent = (baseDef.hp.current / baseDef.hp.max) * 100;
          
          const isLowHp = hpPercent <= 50;

          let blockClass = 'zebra-stripe opacity-60 hover:opacity-100';
          if (isActive && isSelected) blockClass = 'bg-primary/20 border-l-4 border-primary shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] opacity-100';
          else if (isActive) blockClass = 'bg-primary/10 border-l-4 border-primary opacity-100';
          else if (isSelected) blockClass = 'bg-secondary/20 border-l-4 border-secondary opacity-100';

          return (
            <div key={c.instanceId} 
              onClick={() => onSelectTurnId?.(c.instanceId)}
              className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${blockClass}`}
            >
              <div className="w-8 shrink-0 text-center">
                 <InlineEditable 
                   value={c.initiative || 0}
                   isEditing={true}
                   type="number"
                   className={`text-lg font-bold font-label text-center border-none p-0 h-auto focus:border-primary border-b-[1px] ${isActive ? 'text-primary' : 'text-secondary'}`}
                   onSave={(val) => handleUpdateInitiative(c.instanceId, val)}
                 />
              </div>
              <div className="w-10 h-10 bg-surface-container-highest border border-outline-variant/20 shrink-0">
                <img className={`w-full h-full object-cover ${isActive ? 'grayscale brightness-125 contrast-125' : 'grayscale'}`} src={baseDef?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAUESglkJuj-oaFo6pfAClJaamv5ijOb7MlRAZNp1CBVGKv2-9hzRn9tLpi27CS3O3ghq0p7Ubub-6dfka0CUC4XwSYqJ2I_vhWUpkB4jffRkxUZKv7e530UpFeV0f9uRsZOCjjM8xWvxzjZZ6jS31gNyNWib6Vt_FKV4sFV-XWWRNKi9v4wVqHbmV9mPTBhB2TFF7rN5VlsSiw2WQAfIu-d3omVy1uax55Mj3yUhJWk9wCxawj4UEOwmRFTPjIPcEwVxtS0q04aQ"} alt=""/>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[10px] font-bold font-label uppercase truncate ${isActive ? 'text-primary' : 'text-secondary'}`}>{c.name}</div>
                <div className="h-1 w-full bg-surface-container-highest mt-1 overflow-hidden">
                  <div className={`h-full ${isLowHp ? 'bg-error animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]' : isActive ? 'bg-primary-container' : 'bg-primary-container/50'}`} style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}></div>
                </div>
              </div>
              {isActive && <span className="material-symbols-outlined text-primary shrink-0" data-icon="double_arrow">double_arrow</span>}
            </div>
          );
        })}
        {combatants.length === 0 && <div className="p-4 text-xs italic text-outline-variant opacity-70">No combatants added.</div>}
      </div>
    </div>
  );
}
