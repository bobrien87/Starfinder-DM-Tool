import React, { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from '../components/InlineEditable';
import InlineStringArray from '../components/InlineStringArray';
import ConfirmModal from '../components/ConfirmModal';
import InlinePlayerSkills from '../components/InlinePlayerSkills';
import InlinePlayerInventory from '../components/InlinePlayerInventory';
import InlinePlayerWeapons from '../components/InlinePlayerWeapons';

export default function PlayerDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { rollDice, rollDamage } = useDice();
  const { getEntity, encounters, deleteEntity } = useDatabase();
  const [isEditing, setIsEditing] = useState(location.state?.edit || false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const pc = getEntity('players', id);

  const performDelete = async () => {
      await deleteEntity('players', id);
      navigate('/players');
  };

  const hasActiveEncounter = encounters?.some(e => e.status === 'Active');

  const formatMod = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return num >= 0 ? `+${num}` : num;
  };

  if (!pc) {
    return <div className="p-8 text-primary font-bold uppercase tracking-widest text-center">Data Matrix Loading... or Entity Not Found.</div>;
  }

  return (
    <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-surface flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase w-auto min-w-[200px]">
               <InlineEditable value={pc.characterName} collectionName="players" entityId={pc.id} fieldPath="characterName" isEditing={isEditing} />
            </h1>
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <span className="px-2 py-0.5 bg-secondary/10 border border-secondary/30 text-[10px] font-bold font-label text-secondary uppercase">
              Level <InlineEditable value={pc.level} collectionName="players" entityId={pc.id} fieldPath="level" isEditing={isEditing} type="number" className="mx-1 max-w-[30px] inline-block" /> {pc.class}
            </span>
            <InlineStringArray values={pc.traits} collectionName="players" entityId={pc.id} fieldPath="traits" isEditing={isEditing} />
          </div>
          <p className="text-secondary font-label text-xs tracking-widest uppercase opacity-70 mt-1">
            {pc.size} • {pc.heritage} {pc.ancestry} • Played by {pc.playerName}
            <span className="ml-4 text-primary font-bold">Hero Points: {pc.heroPoints}</span>
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {isEditing ? (
             <button onClick={() => setIsDeleteModalOpen(true)} className="w-8 h-8 rounded border border-error/40 text-error flex items-center justify-center hover:bg-error/10 transition-colors" title="Delete PC">
                <span className="material-symbols-outlined text-[18px]">delete</span>
             </button>
          ) : (
             <Link to="/players" className="w-8 h-8 rounded border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors" title="Back to Roster">
                <span className="material-symbols-outlined text-[18px]" data-icon="chevron_left">chevron_left</span>
             </Link>
          )}
          <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`px-6 h-8 flex items-center border font-bold font-label text-xs uppercase tracking-widest transition-all ${isEditing ? 'bg-secondary text-black border-secondary hover:bg-secondary/80' : 'border-primary/40 text-primary hover:bg-primary/10'}`}>
            {isEditing ? 'Save PC' : 'Edit PC'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* ======================= */}
        {/* LEFT COLUMN (1/4 = col-span-3) */}
        {/* ======================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Health & Hit Points */}
          <div className="corner-cut bg-surface-container-high p-6 border-l-2 border-primary relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
            <h2 className="text-xs font-bold font-label text-primary uppercase tracking-widest mb-4">Hit Points</h2>
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-secondary text-xs font-bold uppercase">Current / Max</span>
              <div className={`text-4xl font-black font-headline flex items-baseline gap-1 ${pc.hp?.current / pc.hp?.max <= 0.5 ? 'text-error' : 'text-primary'}`}>
                 {hasActiveEncounter ? (
                    <span title="Locked: Modify inside Active Encounter" style={{cursor: 'not-allowed'}}>{pc.hp.current}</span>
                 ) : (
                    <div className="w-20 inline-block text-right">
                       <InlineEditable value={pc.hp?.current} collectionName="players" entityId={pc.id} fieldPath="hp.current" isEditing={isEditing} type="number" />
                    </div>
                 )}
                 <span className="text-lg font-normal opacity-50">/ {pc.hp.max}</span>
              </div>
            </div>
            {hasActiveEncounter && isEditing && (
                <div className="text-[9px] text-error uppercase font-bold mt-2 tracking-widest text-right">
                    <span className="material-symbols-outlined text-[10px] align-middle mr-1" data-icon="lock">lock</span>
                    Locked By Active Combat
                </div>
            )}
            {pc.hp.temp > 0 && (
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-secondary text-xs font-bold uppercase">Temp HP</span>
                <span className="text-xl font-bold font-headline text-primary">{pc.hp.temp}</span>
              </div>
            )}
          </div>

          {/* Defenses */}
          <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">Max HP</span>
                  <div className="text-3xl font-black font-headline text-primary leading-none w-16">
                     <InlineEditable value={pc.hp?.max} collectionName="players" entityId={pc.id} fieldPath="hp.max" isEditing={isEditing} type="number" />
                  </div>
              </div>
              <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">Armor Class</span>
                  <div className="text-3xl font-black font-headline text-primary leading-none w-16">
                     <InlineEditable value={pc.ac} collectionName="players" entityId={pc.id} fieldPath="ac" isEditing={isEditing} type="number" />
                  </div>
              </div>
              <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center col-span-2">
                  <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">Base Speeds</span>
                  <span className="text-xl font-bold font-headline text-primary leading-none">
                     {pc.speeds?.map(s => `${s.value} ft. ${s.type}`).join(', ')}
                  </span>
              </div>

          {/* Saves */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
            <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-3">Saves</h2>
            <div className="grid grid-cols-1 gap-2">
               <div className="flex justify-between items-center bg-surface p-2 border-l border-outline-variant/30">
                  <span className="text-xs text-secondary font-bold uppercase">Fortitude</span>
                  {isEditing ? (
                     <div className="w-12"><InlineEditable value={pc.saves?.fortitude} collectionName="players" entityId={pc.id} fieldPath="saves.fortitude" isEditing={isEditing} type="number" className="text-lg font-black text-primary" /></div>
                  ) : (
                     <button onClick={() => rollDice('Fortitude Save', pc.saves?.fortitude)} className="text-lg font-black text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(pc.saves?.fortitude)}</button>
                  )}
               </div>
               <div className="flex justify-between items-center bg-surface p-2 border-l border-outline-variant/30">
                  <span className="text-xs text-secondary font-bold uppercase">Reflex</span>
                  {isEditing ? (
                     <div className="w-12"><InlineEditable value={pc.saves?.reflex} collectionName="players" entityId={pc.id} fieldPath="saves.reflex" isEditing={isEditing} type="number" className="text-lg font-black text-primary" /></div>
                  ) : (
                     <button onClick={() => rollDice('Reflex Save', pc.saves?.reflex)} className="text-lg font-black text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(pc.saves?.reflex)}</button>
                  )}
               </div>
               <div className="flex justify-between items-center bg-surface p-2 border-l border-outline-variant/30">
                  <span className="text-xs text-secondary font-bold uppercase">Will</span>
                  {isEditing ? (
                     <div className="w-12"><InlineEditable value={pc.saves?.will} collectionName="players" entityId={pc.id} fieldPath="saves.will" isEditing={isEditing} type="number" className="text-lg font-black text-primary" /></div>
                  ) : (
                     <button onClick={() => rollDice('Will Save', pc.saves?.will)} className="text-lg font-black text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(pc.saves?.will)}</button>
                  )}
               </div>
            </div>
          </div>

          {/* Senses, Immunities & Weaknesses */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <div className="mb-4">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-secondary uppercase font-bold">Perception</span>
                  {isEditing ? (
                     <div className="w-12"><InlineEditable value={pc.perception} collectionName="players" entityId={pc.id} fieldPath="perception" isEditing={isEditing} type="number" className="text-sm font-bold text-primary" /></div>
                  ) : (
                     <button onClick={() => rollDice('Perception', pc.perception)} className="text-sm font-bold text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(pc.perception)}</button>
                  )}
               </div>
               <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-secondary uppercase font-bold">Class DC</span>
                  <span className="text-sm font-bold text-primary">{pc.classDC}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-secondary uppercase font-bold">Base Speed</span>
                  <span className="text-sm font-bold text-primary">{pc.speed}</span>
               </div>
             </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <span className="text-xs text-secondary block mb-1">Resistances:</span>
                <div className="flex gap-1 flex-wrap mb-2">
                  {pc.resistances?.length > 0 ? pc.resistances.map(r => <span key={r} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold font-label">{r}</span>) : <span className="text-xs text-outline-variant">None</span>}
                </div>
                <span className="text-xs text-secondary block mb-1 mt-2">Weaknesses / Immunities:</span>
                <span className="text-xs text-outline-variant">None</span>
             </div>
          </div>

          {/* Narrow Column Overflows (Skills/Inventory) */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-3">Skills</h2>
             <InlinePlayerSkills skills={pc.skills} collectionName="players" entityId={pc.id} isEditing={isEditing} formatMod={formatMod} />
          </div>
          
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest">Inventory</h2>
               <span className="text-xs font-bold text-primary flex items-center">
                   <InlineEditable type="number" value={pc.credits || 0} collectionName="players" entityId={pc.id} fieldPath="credits" isEditing={isEditing} className="w-16 text-right mx-1 bg-surface-container border border-outline-variant/20 rounded" />
                   CR
               </span>
             </div>
             <p className="text-xs text-secondary mb-2 flex items-center">
                <span className="font-bold mr-2">Armor:</span> 
                {isEditing ? (
                   <span className="opacity-50 text-[10px] italic">Edit armor through inventory</span>
                ) : (
                   pc.armor?.name || 'Unarmored'
                )}
             </p>
             <InlinePlayerInventory inventory={pc.inventory} collectionName="players" entityId={pc.id} isEditing={isEditing} />
          </div>

        </div>

        {/* ======================= */}
        {/* RIGHT COLUMN (3/4 = col-span-9) */}
        {/* ======================= */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          
          {/* Attributes */}
          <div className="corner-cut bg-surface-container-high p-6 border-l-2 border-secondary relative">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Attributes</h2>
             <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {pc.attributes && Object.entries(pc.attributes).map(([attr, val]) => (
                  <div key={attr} className="bg-surface-container-highest p-4 flex flex-col items-center">
                    <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-2">{attr}</span>
                    {isEditing ? (
                       <InlineEditable value={val} collectionName="players" entityId={pc.id} fieldPath={`attributes.${attr}`} isEditing={isEditing} type="number" className="text-2xl font-black font-headline text-primary" />
                    ) : (
                       <button onClick={() => rollDice(`${attr} Check`, val)} className="text-2xl font-black font-headline text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(val)}</button>
                    )}
                  </div>
                ))}
             </div>
          </div>

          {/* Strikes & Weapons */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Strikes & Weapons</h2>
             <InlinePlayerWeapons weapons={pc.weapons} pc={pc} collectionName="players" entityId={pc.id} isEditing={isEditing} formatMod={formatMod} />
          </div>

          {/* Features & Feats */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Features & Feats</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {['ancestry', 'class', 'general', 'skill'].map(type => (
                 <div key={type} className="border-t border-outline-variant/20 pt-3">
                   <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-2">{type} Feats</span>
                   <div className="flex flex-wrap gap-2">
                     {pc.feats && pc.feats[type] && pc.feats[type].length > 0 ? pc.feats[type].map(feat => (
                        <span key={feat} className="px-3 py-1.5 bg-surface-container-highest border border-outline-variant/30 text-xs text-primary">{feat}</span>
                     )) : <span className="text-xs text-outline-variant">None Selected</span>}
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

      </div>

      <ConfirmModal 
          isOpen={isDeleteModalOpen}
          title="Delete Character"
          message={`Are you sure you want to permanently delete ${pc.characterName}? This action cannot be undone.`}
          onConfirm={performDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
      />

    </main>
  );
}
