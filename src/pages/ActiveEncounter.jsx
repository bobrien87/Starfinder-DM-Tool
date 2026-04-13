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
   <main className="ml-0 mt-0 p-6 h-[calc(100vh-96px)] flex items-center justify-center bg-transparent">
    <div className="text-center flex flex-col items-center">
     <span className="material-symbols-outlined text-[64px] text-primary/30 mb-4" data-icon="swords">swords</span>
     <h1>No Active Encounter</h1>
     <p className="text-off-white text-sm mb-6 max-w-sm">There is currently no combat or social encounter being tracked. Build or launch an encounter to see it here.</p>
   <Link to="/encounters" className="px-6 py-3 bg-primary text-on-primary font-label text-xs tracking-widest transition-transform active:scale-95 glow-primary inline-flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px]" data-icon="list">list</span>
      Manage Encounters
     </Link>
    </div>
   </main>
  );
 }

  const isCombatantDead = (c) => {
    if (c.type === 'PC') return false;
    const currentHp = c.hp?.current;
    if (currentHp !== undefined && currentHp <= 0) return true;
    return false;
  };

 const handleNextTurn = async () => {
   // Sort to get deterministic order
   const ordered = [...(activeEncounter.combatants || [])].sort((a,b) => (b.initiative || 0) - (a.initiative || 0));
   if (ordered.length === 0) return;

   const currentIndex = ordered.findIndex(c => c.instanceId === activeEncounter.activeTurnId);
   
   let nextIndex = currentIndex !== -1 ? currentIndex : -1;
   let nextRound = activeEncounter.round || 1;
   let loopCount = 0;
   let foundNext = false;

   while (loopCount < ordered.length) {
     if (nextIndex < ordered.length - 1) {
       nextIndex++;
     } else {
       nextIndex = 0;
       nextRound += 1;
     }
     
     if (!isCombatantDead(ordered[nextIndex])) {
       foundNext = true;
       break;
     }
     loopCount++;
   }

   if (!foundNext) return;
   
   let nextTurnId = ordered[nextIndex].instanceId;

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
   
   let prevIndex = currentIndex !== -1 ? currentIndex : 0;
   let prevRound = activeEncounter.round || 1;
   let loopCount = 0;
   let foundPrev = false;

   while (loopCount < ordered.length) {
     if (prevIndex > 0) {
       prevIndex--;
     } else {
       if (prevRound > 1) {
         prevRound -= 1;
         prevIndex = ordered.length - 1;
       } else {
         break; // Stuck at very beginning
       }
     }
     
     if (!isCombatantDead(ordered[prevIndex])) {
       foundPrev = true;
       break;
     }
     loopCount++;
   }

   if (!foundPrev) return;

   let prevTurnId = ordered[prevIndex].instanceId;

   await updateEntity('encounters', activeEncounter.id, {
     activeTurnId: prevTurnId,
     round: prevRound
   });
 };

 return (
  <main className="ml-0 mt-0 p-6 pb-12 flex-1 w-full overflow-y-scroll bg-transparent flex flex-col gap-6">
   {/* Top Status Bar */}
   <div className="flex justify-between items-end border-b pb-4 border-tertiary/30">
    <div>
     <h1>{activeEncounter.title || 'Unknown Encounter'}</h1>
    </div>
   </div>

   <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
    {/* Left Column: Initiative Queue */}
    <EncounterInitiativeList 
     encounter={activeEncounter} 
     selectedTurnId={selectedTurnId} 
     onSelectTurnId={setSelectedTurnId} 
     onNextTurn={handleNextTurn}
     onPrevTurn={handlePrevTurn}
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

