import React, { useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { RARITY_COLORS } from '../utils/constants';
import StatPill from '../components/StatPill';
import InlineEditable from '../components/InlineEditable';
import ConfirmModal from '../components/ConfirmModal';
import Button from '../components/Button';
import CustomSelect from '../components/CustomSelect';
import CustomMultiSelect from '../components/CustomMultiSelect';

export default function EncounterDetail() {
 const { id } = useParams();
 const navigate = useNavigate();
 const location = useLocation();
 const { encounters, updateEntity, players, creatures, items, getEntity, deleteEntity } = useDatabase();
 const [selectedPlayerId, setSelectedPlayerId] = useState('');
 const [selectedCreatureId, setSelectedCreatureId] = useState('');
 const [selectedRewardId, setSelectedRewardId] = useState('');
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 
 // Multi-Select Hook
 const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
 const [multiSelectedPlayers, setMultiSelectedPlayers] = useState([]);

 // Filter Hooks for Creature Database
 const [filterTraits, setFilterTraits] = useState([]);
 const [filterRarity, setFilterRarity] = useState('Any');
 const [filterLevelMin, setFilterLevelMin] = useState('');
 const [filterLevelMax, setFilterLevelMax] = useState('');

 const performDelete = async () => {
   await deleteEntity('encounters', id);
   navigate('/encounters');
 };

 const encounter = encounters?.find(e => e.id === id);

 if (!encounter) return <div className="p-6 text-primary">Loading encounter...</div>;

 const availableEntities = [
  ...(players || []).map(p => ({ ...p, _type: 'PC', name: p.characterName || 'Unknown PC' })),
  ...(creatures || []).map(c => ({ ...c, _type: 'Creature', name: c.name || 'Unknown Creature' }))
 ].sort((a, b) => a.name.localeCompare(b.name));

 const handleAddCombatant = async (idToMap) => {
  if (!idToMap) return;
  const entity = availableEntities.find(e => e.id === idToMap);
  if (!entity) return;

  const newInstanceId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const currentCombatants = encounter.combatants || [];
  
  const newCombatant = {
    instanceId: newInstanceId,
    refId: entity.id,
    type: entity._type,
    name: entity.name, // base name (overridable)
    initiative: entity._type === 'Creature' ? Math.floor(Math.random() * 20) + 1 + (entity.saves?.reflex || entity.level || 0) : 0,
    isDelaying: false,
    isDefeated: false,
    // Clone base HP into volatility object for creatures, enforcing MAX health initialization
    hp: entity._type === 'Creature' ? { 
      current: entity.hp?.max || entity.hp?.current || 1, 
      max: entity.hp?.max || entity.hp?.current || 1, 
      temp: 0 
    } : null,
    conditions: []
  };

  try {
    await updateEntity('encounters', id, {
      combatants: [...currentCombatants, newCombatant]
    });
    setSelectedCreatureId('');
  } catch (err) { console.error(err); }
 };

 const openPlayerModal = () => {
   const pcIds = (encounter.combatants || []).filter(c => c.type === 'PC').map(c => c.refId);
   setMultiSelectedPlayers(pcIds);
   setIsAddPlayerModalOpen(true);
 };

 const handleAddMultipleCombatants = async () => {
  const currentCombatants = encounter.combatants || [];
  const nonPcCombatants = currentCombatants.filter(c => c.type !== 'PC');
  const newPcCombatants = [];
  
  for (const pId of multiSelectedPlayers) {
    const existing = currentCombatants.find(c => c.type === 'PC' && c.refId === pId);
    if (existing) {
      newPcCombatants.push(existing);
      continue;
    }

    const entity = availableEntities.find(e => e.id === pId);
    if (!entity || entity._type !== 'PC') continue;
    newPcCombatants.push({
      instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      refId: entity.id,
      type: entity._type,
      name: entity.name, 
      initiative: 0,
      isDelaying: false,
      isDefeated: false,
      hp: null,
      conditions: []
    });
  }

  try {
    await updateEntity('encounters', id, {
      combatants: [...nonPcCombatants, ...newPcCombatants]
    });
    setIsAddPlayerModalOpen(false);
  } catch (err) { console.error(err); }
 };

 const handleRemoveCombatant = async (instanceId) => {
   const currentCombatants = encounter.combatants || [];
   try {
     await updateEntity('encounters', id, {
       combatants: currentCombatants.filter(c => c.instanceId !== instanceId)
     });
   } catch (err) { console.error(err); }
 };

 const handleLaunch = async () => {
  try {
   // Pause any previously active encounters to prevent collision
   const previouslyActive = encounters.filter(e => e.status === 'Active' && e.id !== id);
   for (const e of previouslyActive) {
     await updateEntity('encounters', e.id, { status: 'Paused' });
   }

   await updateEntity('encounters', id, { status: 'Active' });
   navigate('/');
  } catch (err) {
   console.error(err);
  }
 };

 const filteredCreatures = (creatures || []).filter(c => {
   // Level Range
   const minLevel = filterLevelMin !== '' ? Number(filterLevelMin) : -10;
   const maxLevel = filterLevelMax !== '' ? Number(filterLevelMax) : 30;
   const lvl = c.level || 0;
   if (lvl < minLevel || lvl > maxLevel) return false;

   // Trait Search (AND Logic)
   if (filterTraits.length > 0) {
     const hasAllTraits = filterTraits.every(t => c.traits?.some(ct => ct.toLowerCase() === t.toLowerCase()));
     if (!hasAllTraits) return false;
   }

   // Rarity
   if (filterRarity !== 'Any') {
     const isCommon = !c.rarity && !c.traits?.some(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()));
     const actualRarity = c.rarity ? c.rarity.toLowerCase() : (isCommon ? 'common' : c.traits?.find(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()))?.toLowerCase() || 'common');
     
     if (actualRarity !== filterRarity.toLowerCase()) return false;
   }

   return true;
 }).sort((a,b) => (a.level || 0) - (b.level || 0));

 // --- XP & Threat Calculation ---
 const pcCombatants = (encounter.combatants || []).filter(c => c.type === 'PC');
 const creatureCombatants = (encounter.combatants || []).filter(c => c.type === 'NPC' || c.type === 'Creature');
 
 const getPartyLevel = () => {
  if (pcCombatants.length === 0) return 1;
  let totalLevels = 0;
  pcCombatants.forEach(c => {
    const p = getEntity('players', c.refId);
    totalLevels += (p?.level || 1);
  });
  return Math.round(totalLevels / pcCombatants.length);
 };

 const PL = getPartyLevel();
 const numPCs = pcCombatants.length === 0 ? 4 : pcCombatants.length;
 const adjust = numPCs - 4;

 const baseBudgets = {
   Trivial: 40 + (adjust * 10),
   Low: 60 + (adjust * 15),
   Moderate: 80 + (adjust * 20),
   Severe: 120 + (adjust * 30),
   Extreme: 160 + (adjust * 40)
 };

 const getCreatureXP = (cLevel, pLevel) => {
   const diff = cLevel - pLevel;
   if (diff <= -4) return 10;
   if (diff === -3) return 15;
   if (diff === -2) return 20;
   if (diff === -1) return 30;
   if (diff === 0) return 40;
   if (diff === 1) return 60;
   if (diff === 2) return 80;
   if (diff === 3) return 120;
   if (diff >= 4) return 160;
   return 0;
 };

 const currentTotalXP = creatureCombatants.reduce((sum, c) => {
   const dbCreature = getEntity('creatures', c.refId);
   const cLvl = dbCreature?.level ?? 1;
   return sum + getCreatureXP(cLvl, PL);
 }, 0);

 const getThreatLevel = (xp) => {
   if (xp < baseBudgets.Low) return { name: 'Trivial', color: 'text-primary border-outline-variant/30' };
   if (xp < baseBudgets.Moderate) return { name: 'Low', color: 'text-primary bg-primary/10 border-primary/30' };
   if (xp < baseBudgets.Severe) return { name: 'Moderate', color: 'text-[#ffb142] bg-[#ffb142]/10 border-[#ffb142]/30' };
   if (xp < baseBudgets.Extreme) return { name: 'Severe', color: 'text-[#ff5252] bg-[#ff5252]/10 border-[#ff5252]/30' };
   return { name: 'Extreme', color: 'text-[#c23616] bg-[#c23616]/20 border-[#c23616]/50' };
 };

 const threat = getThreatLevel(currentTotalXP);

 // --- Rewards Management ---
 const handleAddReward = async (idToMap) => {
   if (!idToMap) return;
   const currentRewards = encounter.rewards || [];
   const newReward = {
     instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
     itemId: idToMap,
     quantity: 1
   };
   try {
     await updateEntity('encounters', id, { rewards: [...currentRewards, newReward] });
     setSelectedRewardId('');
   } catch (err) { console.error(err); }
 };

 const handleRemoveReward = async (instanceId) => {
   const currentRewards = encounter.rewards || [];
   try {
     await updateEntity('encounters', id, {
       rewards: currentRewards.filter(r => r.instanceId !== instanceId)
     });
   } catch (err) { console.error(err); }
 };
 // ---------------------------------

 return (
  <>
  <main className="page-layout-wrapper">
   <div className="flex justify-between items-end border-b pb-4 border-tertiary/30">
    <div>
     <div className="flex items-center gap-4">
       <h1 className="w-auto min-w-[200px]">
        <InlineEditable value={encounter.title || 'Unknown Encounter'} collectionName="encounters" entityId={id} fieldPath="title" isEditing={true} className="w-full text-left bg-transparent !border-dashed hover:border-primary pb-1 cursor-text transition-colors" />
       </h1>
     </div>
     <div className="flex flex-wrap gap-2 mt-2 items-center">
    <span className={`px-2 py-0.5 border text-[12px] font-label ${encounter.status === 'Active' ? 'bg-primary/20 border-primary/50 text-primary glow-primary' : 'border-outline-variant/30 text-primary'}`}>
        {encounter.status}
       </span>
     </div>
    </div>
    <div className="flex gap-4 items-center">
     <button onClick={() => setIsDeleteModalOpen(true)} className="w-8 h-8 rounded border border-accent-yellow/40 text-accent-yellow flex items-center justify-center hover:bg-accent-yellow/10 transition-colors" title="Delete Encounter">
       <span className="material-symbols-outlined text-[18px]">delete</span>
     </button>
     <Link to="/encounters" className="w-8 h-8 rounded border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors" title="Back">
       <span className="material-symbols-outlined text-[18px]">chevron_left</span>
     </Link>
     <Button variant="primary" icon="play_arrow" onClick={handleLaunch}>Run</Button>
    </div>
   </div>

   <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
    
    {/* Left Column: Player Characters & GM Notes (col-span-4) */}
    <div className="col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
      
      <div>
        <div className="flex justify-start items-end border-b pb-1 mb-3 border-tertiary/30">
     <button onClick={openPlayerModal} className="text-xs font-label text-primary flex items-center tracking-widest border-b hover: pb-[1px] transition-colors border-tertiary/30">
            <span className="material-symbols-outlined text-[16px] mr-2">manage_accounts</span> Manage Player Characters
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {(encounter.combatants || []).filter(c => c.type === 'PC').map((c) => {
            return (
       <div key={c.instanceId} className="inline-flex items-center gap-2 border border-outline-variant/30 px-3 py-1 text-[12px] font-label tracking-widest text-primary group select-none">
                {c.name}
                <button onClick={() => handleRemoveCombatant(c.instanceId)} className="text-primary/50 hover:text-accent-yellow transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]" data-icon="close">close</span>
                </button>
              </div>
            );
          })}
        </div>
        {(encounter.combatants || []).filter(c => c.type === 'PC').length === 0 && (
          <span className="text-xs text-outline-variant italic opacity-70 mb-2 block">No players assigned.</span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3>
         <span className="material-symbols-outlined text-[16px]" data-icon="data_usage">data_usage</span>
         Encounter Summary
        </h3>
        <div className="border border-outline-variant/10 p-3 flex flex-col gap-3">
          <div className="pb-2 border-b border-tertiary/30">
      <span className="text-[12px] text-primary tracking-widest">{numPCs} level {PL} Player Characters</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
       <span className="text-[12px] text-primary tracking-widest">Total XP</span>
              <span className="text-2xl text-primary font-headline leading-none">{currentTotalXP}</span>
            </div>
      <div className={`px-3 py-1 tracking-widest text-[12px] ${threat.color} border`}>
              {threat.name} Threat
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 mt-2">
            {Object.entries(baseBudgets).map(([name, budget]) => {
              const isActive = currentTotalXP >= budget && (name === 'Extreme' || currentTotalXP < Object.values(baseBudgets)[Object.keys(baseBudgets).indexOf(name)+1]);
              return (
                <div key={name} className={`flex flex-col border ${isActive ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/5 '} p-1 items-center justify-center relative transition-colors`}>
         <span className={`text-[8px] tracking-widest mb-0.5 ${isActive ? 'text-primary' : 'text-primary opacity-70'}`}>{name}</span>
                  <span className={`text-[12px] ${isActive ? 'text-primary' : 'text-primary/50'}`}>{budget}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <h3>
         <span className="material-symbols-outlined text-[16px]" data-icon="edit_document">edit_document</span>
         Encounter Notes
        </h3>
        <div className="border border-outline-variant/10 p-4 flex-1 flex flex-col relative group min-h-[300px]">
         <textarea 
           className="flex-1 w-full h-full bg-transparent border-none resize-none outline-none focus:ring-0 text-sm text-[#dce3f0] placeholder:text-outline-variant/50" 
           placeholder="Type your description, tactics, or read-aloud text here..."
           value={encounter.notes || ''}
           onChange={(e) => updateEntity('encounters', id, { notes: e.target.value })}
         />
     <span className="absolute bottom-2 right-2 text-[12px] text-primary/30 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Auto-Saves</span>
        </div>
      </div>

      {/* Rewards Panel */}
      <div className="flex flex-col gap-4">
        <h3>
         <span className="material-symbols-outlined text-[16px]" data-icon="redeem">redeem</span>
         Rewards
        </h3>
        <div className="border border-outline-variant/10 p-3 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {(encounter.rewards || []).map((r) => {
              const itemDef = getEntity('items', r.itemId);
              return (
                <div key={r.instanceId} className="flex justify-between items-center p-2 border border-outline-variant/10 group">
                  <div className="flex items-center gap-2">
          <span className="text-xs text-primary ">{itemDef?.name || 'Unknown Item'}</span>
                    <span className="text-[12px] text-primary">x{r.quantity}</span>
                  </div>
                  <button onClick={() => handleRemoveReward(r.instanceId)} className="text-primary/50 hover:text-accent-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]" data-icon="close">close</span>
                  </button>
                </div>
              );
            })}
            {(encounter.rewards || []).length === 0 && (
              <span className="text-xs text-outline-variant italic opacity-70">No rewards linked.</span>
            )}
          </div>
          <div className="flex gap-2 mt-1 pt-3 ">
            <CustomSelect 
              value={selectedRewardId}
              onChange={setSelectedRewardId}
              placeholder="Link Item..."
              options={(items || []).map(i => ({ label: i.name, value: i.id }))}
              className="flex-1"
            />
            <Button variant="secondary" onClick={() => handleAddReward(selectedRewardId)} disabled={!selectedRewardId} className="!px-3 !h-8 !text-[12px]">Add</Button>
          </div>
        </div>
      </div>

    </div>

    {/* Right Column: Creature Database & Assigned Creatures (col-span-8) */}
    <div className="col-span-8 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
      
      {/* Assigned Creatures */}
      <div>
        <div className="flex justify-between items-end border-b pb-1 mb-3 border-tertiary/30">
          <h3>
            <span className="material-symbols-outlined text-[16px]" data-icon="pest_control">pest_control</span>
            Creatures
          </h3>
     <div className="text-[12px] text-primary tracking-widest">
            Count: <span className="text-primary ml-1">{(encounter.combatants || []).filter(c => c.type === 'NPC' || c.type === 'Creature').length}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(encounter.combatants || []).filter(c => c.type === 'NPC' || c.type === 'Creature').map((c) => {
            const baseDef = getEntity('creatures', c.refId);
            return (
       <div key={c.instanceId} className="inline-flex items-center gap-2 border border-outline-variant/50 px-3 py-1 text-[12px] font-label tracking-widest group shadow-sm">
                <span className="text-primary truncate max-w-[150px]" title={c.name}>{c.name}</span>
                <span className="text-primary/70">Lvl.{baseDef?.level ?? '?'}</span>
                <button onClick={() => handleRemoveCombatant(c.instanceId)} className="text-primary/50 hover:text-accent-yellow transition-colors flex items-center justify-center p-0.5 ml-1">
                  <span className="material-symbols-outlined text-[14px]" data-icon="close">close</span>
                </button>
              </div>
            );
          })}
        </div>
        {(encounter.combatants || []).filter(c => c.type === 'NPC' || c.type === 'Creature').length === 0 && (
          <span className="text-xs text-outline-variant italic opacity-70">No creatures assigned.</span>
        )}
      </div>

      {/* Database Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 p-4 border border-outline-variant/10 shrink-0 relative z-20">
         <div className="flex flex-col gap-1 w-full sm:w-auto">
      <label className="text-[12px] text-primary tracking-widest">Rarity</label>
           <CustomSelect 
             value={filterRarity}
             onChange={setFilterRarity}
             options={[
               { label: 'Any', value: 'Any' },
               { label: 'Common', value: 'Common' },
               { label: 'Uncommon', value: 'Uncommon' },
               { label: 'Rare', value: 'Rare' },
               { label: 'Unique', value: 'Unique' },
             ]}
             className="w-full sm:min-w-[120px]"
           />
         </div>
            <div className="flex flex-col gap-1 flex-1">
       <label className="text-[12px] text-primary tracking-widest">Filter Traits</label>
              <CustomMultiSelect 
                value={filterTraits} 
                onChange={setFilterTraits} 
                options={Array.from(new Set((creatures || []).flatMap(c => c.traits || []))).sort()} 
                placeholder="e.g. humanoid..."
              />
            </div>
         <div className="flex flex-col gap-1 w-full sm:w-auto">
      <label className="text-[12px] text-primary tracking-widest">Level Range</label>
           <div className="flex items-center gap-2">
             <input 
              type="number" 
              value={filterLevelMin}
              onChange={e => setFilterLevelMin(e.target.value)}
              placeholder="Min"
              className="form-input-number"
             />
             <span className="text-primary text-xs">-</span>
             <input 
              type="number" 
              value={filterLevelMax}
              onChange={e => setFilterLevelMax(e.target.value)}
              placeholder="Max"
              className="form-input-number"
             />
           </div>
         </div>
        </div>
      </div>

      {/* Creature List Output */}
      <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto pr-2 pb-2">
        {filteredCreatures.map((c) => {
         const isCommon = !c.rarity && !c.traits?.some(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()));
         const actualRarity = c.rarity ? c.rarity : (isCommon ? 'Common' : c.traits?.find(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase())) || 'Common');
         const rarityLower = actualRarity.toLowerCase();
         
         let rarityColor = RARITY_COLORS[rarityLower] || RARITY_COLORS.common;

         return (
         <div key={c.id} className="corner-cut p-4 border-l-2 border-primary relative flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:transition-colors shrink-0 shadow-sm">
          
          
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
       <h4 className="text-lg font-headline text-off-white tracking-tight leading-none">{c.name}</h4>
       <span className="text-primary/70 text-xs tracking-widest whitespace-nowrap">Level {c.level}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <StatPill variant="custom" size="xs" className={`${rarityColor} border`}>{actualRarity}</StatPill>
              {c.traits?.filter(t => !['common', 'uncommon', 'rare', 'unique'].includes(t.toLowerCase())).map((t, i) => <StatPill key={i} size="xs">{t}</StatPill>)}
            </div>
          </div>

          <div className="shrink-0 flex items-center md:pl-4 md:md:">
             <Button variant="secondary" icon="add" onClick={() => handleAddCombatant(c.id)} className="w-full md:w-auto">Add to Encounter</Button>
          </div>
         </div>
        )})}

        {filteredCreatures.length === 0 && (
          <div className="p-8 text-center text-xs text-outline-variant italic border border-outline-variant/10 ">
            No creatures found matching your criteria.
          </div>
        )}
      </div>

    </div>

   </div>

   <ConfirmModal 
     isOpen={isDeleteModalOpen}
     title="Delete Encounter"
     message={`Are you sure you want to permanently delete '${encounter.title}'? All combatant references will be lost.`}
     onConfirm={performDelete}
     onCancel={() => setIsDeleteModalOpen(false)}
   />

  </main>

  {isAddPlayerModalOpen && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
     <div className="border border-primary/30 p-6 shadow-2xl max-w-sm w-full">
   <h4 className="text-xl font-headline text-off-white mb-4 tracking-tighter">Manage Player Characters</h4>
      <div className="flex flex-col gap-2 mb-6 max-h-60 overflow-y-auto pr-2">
        {(players || []).map(p => {
          const isChecked = multiSelectedPlayers.includes(p.id);
          return (
          <label key={p.id} className="flex flex-row items-center gap-3 p-2 border border-outline-variant/20 hover:transition-colors cursor-pointer select-none">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                className="opacity-0 absolute w-full h-full cursor-pointer"
                checked={isChecked}
                onChange={(e) => {
                  if (e.target.checked) setMultiSelectedPlayers([...multiSelectedPlayers, p.id]);
                  else setMultiSelectedPlayers(multiSelectedPlayers.filter(id => id !== p.id));
                }}
              />
              <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary glow-primary' : 'border-outline-variant/50'}`}>
                {isChecked && <span className="material-symbols-outlined text-[14px] text-on-primary " data-icon="check">check</span>}
              </div>
            </div>
            <div className="flex flex-col">
       <span className="text-sm text-primary ">{p.characterName || p.name}</span>
       <span className="text-[12px] text-primary font-label">Lvl {p.level} • {p.class}</span>
            </div>
          </label>
        )})}
        {(players || []).length === 0 && <span className="text-xs text-primary italic">No players available in database.</span>}
      </div>
      <div className="flex gap-4 justify-end">
        <Button variant="ghost" onClick={() => setIsAddPlayerModalOpen(false)}>Cancel</Button>
        <Button variant="primary" onClick={handleAddMultipleCombatants}>Update</Button>
      </div>
     </div>
    </div>
  )}

  </>
 );
}
