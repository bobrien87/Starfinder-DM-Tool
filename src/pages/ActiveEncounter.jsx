import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import EncounterInitiativeList from '../components/EncounterInitiativeList';
import EncounterActiveOverlay from '../components/EncounterActiveOverlay';
import Button from '../components/Button';
import { CONDITIONS } from '../data/conditions';
import { useNavigate } from 'react-router-dom';

export default function ActiveEncounter() {
  const { rollDice, rollDamage } = useDice();
  const { encounters, getEntity, updateEntity } = useDatabase();
  const [selectedTurnId, setSelectedTurnId] = useState(null);
  const navigate = useNavigate();

  const activeEncounter = encounters?.find(e => e.status === 'Active');

  if (!activeEncounter) {
    return (
      <main className="ml-0 mt-0 p-6 h-[calc(100vh-64px)] flex items-center justify-center bg-surface">
        <div className="text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-primary/30 mb-4" data-icon="swords">swords</span>
          <h1 className="text-2xl font-black font-headline text-primary mb-2 uppercase tracking-widest">No Active Encounter</h1>
          <p className="text-secondary text-sm mb-6 max-w-sm">There is currently no combat or social encounter being tracked. Build or launch an encounter to see it here.</p>
          <Link to="/encounters" className="px-6 py-3 bg-primary text-on-primary font-bold font-label text-xs uppercase tracking-widest transition-transform active:scale-95 glow-primary inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" data-icon="list">list</span>
            Manage Encounters
          </Link>
        </div>
      </main>
    );
  }

  const handleNextTurn = async () => {
      // Sort to get deterministic order
      const ordered = [...(activeEncounter.combatants || [])].sort((a,b) => (b.initiative || 0) - (a.initiative || 0));
      if (ordered.length === 0) return;

      const currentIndex = ordered.findIndex(c => c.instanceId === activeEncounter.activeTurnId);
      
      let nextTurnId = ordered[0].instanceId;
      let nextRound = activeEncounter.round || 1;

      if (currentIndex !== -1 && currentIndex < ordered.length - 1) {
          nextTurnId = ordered[currentIndex + 1].instanceId;
      } else if (currentIndex === ordered.length - 1) {
          // Wrap around and increment round!
          nextRound += 1;
      }

      // Process End of Turn hooks (Condition Decays)
      if (currentIndex !== -1) {
          const endingCombatant = ordered[currentIndex];
          const isPC = endingCombatant.type === 'PC';
          const baseEntity = getEntity(isPC ? 'players' : 'creatures', endingCombatant.refId);
          const activeConditions = isPC ? (baseEntity?.conditions || []) : (endingCombatant.conditions || []);

          let conditionsChanged = false;
          const newConditions = [];
          
          activeConditions.forEach(cond => {
              const def = CONDITIONS[cond.name];
              let shouldKeep = true;
              let newValue = cond.value;

              // Handle mechanical value decay (e.g. Frightened 2 -> Frightened 1)
              if (def?.decayAtEndOfTurn && def?.hasValue) {
                  if (newValue - 1 > 0) {
                      newValue -= 1;
                  } else {
                      shouldKeep = false;
                  }
              }

              // Handle explicit duration round decay (e.g. duration: 3 -> duration: 2)
              let newDuration = cond.duration;
              if (newDuration !== undefined && newDuration > 0) {
                  newDuration -= 1;
                  if (newDuration <= 0) {
                      shouldKeep = false;
                  }
              }

              if (shouldKeep) {
                  const updatedCond = { ...cond };
                  if (cond.value !== undefined) updatedCond.value = newValue;
                  if (cond.duration !== undefined) updatedCond.duration = newDuration;
                  newConditions.push(updatedCond);
                  if (newValue !== cond.value || newDuration !== cond.duration) conditionsChanged = true;
              } else {
                  conditionsChanged = true; // A condition was dropped!
              }
          });

          if (conditionsChanged) {
             if (isPC && baseEntity) {
                 await updateEntity('players', baseEntity.id, { conditions: newConditions });
             } else {
                 const newCombatants = activeEncounter.combatants.map(c => 
                    c.instanceId === endingCombatant.instanceId ? { ...c, conditions: newConditions } : c
                 );
                 await updateEntity('encounters', activeEncounter.id, { combatants: newCombatants });
             }
          }
      }

      await updateEntity('encounters', activeEncounter.id, {
          activeTurnId: nextTurnId,
          round: nextRound
      });
  };

  const handlePrevTurn = async () => {
      const ordered = [...(activeEncounter.combatants || [])].sort((a,b) => (b.initiative || 0) - (a.initiative || 0));
      if (ordered.length === 0) return;

      const currentIndex = ordered.findIndex(c => c.instanceId === activeEncounter.activeTurnId);
      
      let prevTurnId = ordered[ordered.length - 1].instanceId;
      let prevRound = activeEncounter.round || 1;

      if (currentIndex > 0) {
          prevTurnId = ordered[currentIndex - 1].instanceId;
      } else if (currentIndex === 0) {
          // Wrap backwards
          if (prevRound > 1) {
              prevRound -= 1;
              prevTurnId = ordered[ordered.length - 1].instanceId;
          } else {
              prevTurnId = ordered[0].instanceId; // Stuck at very beginning
          }
      }

      await updateEntity('encounters', activeEncounter.id, {
          activeTurnId: prevTurnId,
          round: prevRound
      });
  };

  return (
    <main className="ml-0 mt-0 p-6 pb-12 h-[calc(100vh-64px)] overflow-y-auto bg-surface flex flex-col gap-6">
      {/* Top Status Bar */}
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase">{activeEncounter.title || 'Unknown Encounter'}</h1>
          <p className="text-secondary font-label text-xs tracking-widest uppercase opacity-70">Round {activeEncounter.round || 1}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="secondary" onClick={handlePrevTurn} icon="skip_previous" className="!px-3" title="Previous Turn" />
          <Button variant="primary" onClick={handleNextTurn}>Next Turn</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Initiative Queue */}
        <EncounterInitiativeList 
          encounter={activeEncounter} 
          selectedTurnId={selectedTurnId} 
          onSelectTurnId={setSelectedTurnId} 
        />

        {/* Center/Right Dual Panels */}
        <EncounterActiveOverlay 
          encounter={activeEncounter} 
          selectedTurnId={selectedTurnId}
        />
      </div>
    </main>
  );
}

