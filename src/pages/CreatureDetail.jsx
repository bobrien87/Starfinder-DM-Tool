import React, { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from '../components/InlineEditable';
import InlineStringArray from '../components/InlineStringArray';
import ConfirmModal from '../components/ConfirmModal';
import InlineCreatureAttacks from '../components/InlineCreatureAttacks';
import InlineSkillMap from '../components/InlineSkillMap';
import InlineReferenceArray from '../components/InlineReferenceArray';
import InlineCreatureSpells from '../components/InlineCreatureSpells';

export default function CreatureDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { rollDice, rollDamage } = useDice();
  const { getEntity, deleteEntity } = useDatabase();
  const [isEditing, setIsEditing] = useState(location.state?.edit || false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatMod = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return num >= 0 ? `+${num}` : num;
  };

  const npc = getEntity('creatures', id);

  const performDelete = async () => {
      await deleteEntity('creatures', id);
      navigate('/creatures');
  };

  if (!npc) {
     return <div className="p-8 text-primary font-bold uppercase tracking-widest text-center">Data Matrix Loading... or Entity Not Found.</div>;
  }

  return (
    <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-surface flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase w-auto min-w-[200px]">
               <InlineEditable value={npc.name} collectionName="creatures" entityId={npc.id} fieldPath="name" isEditing={isEditing} />
            </h1>
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <span className="px-2 py-0.5 bg-secondary/10 border border-secondary/30 text-[10px] font-bold font-label text-secondary uppercase">
               Level <InlineEditable value={npc.level} collectionName="creatures" entityId={npc.id} fieldPath="level" isEditing={isEditing} type="number" className="mx-1 max-w-[30px] inline-block" />
            </span>
            <InlineStringArray values={npc.traits} collectionName="creatures" entityId={npc.id} fieldPath="traits" isEditing={isEditing} />
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {isEditing ? (
             <button onClick={() => setIsDeleteModalOpen(true)} className="w-8 h-8 rounded border border-error/40 text-error flex items-center justify-center hover:bg-error/10 transition-colors" title="Delete Creature">
                <span className="material-symbols-outlined text-[18px]">delete</span>
             </button>
          ) : (
            <Link to="/creatures" className="w-8 h-8 rounded border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors" title="Back">
               <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Link>
          )}
          <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`px-6 h-8 flex items-center border font-bold font-label text-xs uppercase tracking-widest transition-all ${isEditing ? 'bg-secondary text-black border-secondary hover:bg-secondary/80' : 'border-primary/40 text-primary hover:bg-primary/10'}`}>
            {isEditing ? 'Save NPC' : 'Edit NPC'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* ======================= */}
        {/* LEFT COLUMN (1/4 = col-span-3) */}
        {/* ======================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Core Defenses */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                   <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">Max HP</span>
                   <div className="text-3xl font-black font-headline text-primary leading-none w-16">
                      <InlineEditable value={npc.hp?.max} collectionName="creatures" entityId={npc.id} fieldPath="hp.max" isEditing={isEditing} type="number" />
                   </div>
               </div>
               <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                   <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">Armor Class</span>
                   <div className="text-3xl font-black font-headline text-primary leading-none w-16">
                      <InlineEditable value={npc.ac} collectionName="creatures" entityId={npc.id} fieldPath="ac" isEditing={isEditing} type="number" />
                   </div>
               </div>
               <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center col-span-2">
                   <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">Base Speeds</span>
                   <span className="text-xl font-bold font-headline text-primary leading-none">
                      {npc.speeds?.map(s => `${s.value} ft. ${s.type}`).join(', ') || 'None'}
                   </span>
               </div>
             </div>
          </div>

          {/* Saves */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
            <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-3">Saves</h2>
            <div className="grid grid-cols-1 gap-2">
               {['fortitude', 'reflex', 'will'].map(saveType => (
                 <div key={saveType} className="flex justify-between items-center bg-surface p-2 border-l border-outline-variant/30">
                    <span className="text-xs text-secondary font-bold uppercase">{saveType}</span>
                    {isEditing ? (
                       <div className="w-12"><InlineEditable value={npc.saves?.[saveType]} collectionName="creatures" entityId={npc.id} fieldPath={`saves.${saveType}`} isEditing={isEditing} type="number" className="text-lg font-black text-primary" /></div>
                    ) : (
                       <button onClick={() => rollDice(`${saveType} Save`, npc.saves?.[saveType] || 0)} className="text-lg font-black text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(npc.saves?.[saveType] || 0)}</button>
                    )}
                 </div>
               ))}
            </div>
          </div>

          {/* Senses, Immunities & Weaknesses */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <div className="mb-4">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-secondary uppercase font-bold">Perception</span>
                  {isEditing ? (
                     <div className="w-12"><InlineEditable value={npc.perception} collectionName="creatures" entityId={npc.id} fieldPath="perception" isEditing={isEditing} type="number" className="text-sm font-bold text-primary" /></div>
                  ) : (
                     <button onClick={() => rollDice('Perception', npc.perception || 0)} className="text-sm font-bold text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(npc.perception || 0)}</button>
                  )}
               </div>
                <div className="mt-2 pt-2 border-t border-outline-variant/10">
                  <span className="text-[10px] text-secondary font-label uppercase block mb-1">Senses</span>
                  <InlineStringArray values={npc.senses} collectionName="creatures" entityId={npc.id} fieldPath="senses" isEditing={isEditing} pillClass="px-1.5 py-0.5 bg-surface-container-highest border border-outline-variant/10 text-[9px] font-bold font-label text-primary uppercase" />
                </div>
                <div className="mt-2 pt-2 border-t border-outline-variant/10">
                  <span className="text-[10px] text-secondary font-label uppercase block mb-1">Languages</span>
                  <InlineStringArray values={npc.languages} collectionName="creatures" entityId={npc.id} fieldPath="languages" isEditing={isEditing} pillClass="px-1.5 py-0.5 bg-surface-container-highest border border-outline-variant/10 text-[9px] font-bold font-label text-primary uppercase" />
                </div>
              </div>

             <div className="border-t border-outline-variant/20 pt-4">
                <span className="text-[10px] text-secondary font-label uppercase block mb-1">Resistances:</span>
                <div className="flex gap-1 flex-wrap mb-3">
                  {npc.resistances?.length > 0 ? npc.resistances.map(r => <span key={r.type} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold font-label">{r.type} {r.value}</span>) : <span className="text-xs text-outline-variant">None</span>}
                </div>
                
                <span className="text-[10px] text-secondary font-label uppercase block mb-1">Weaknesses:</span>
                <div className="flex gap-1 flex-wrap mb-3">
                  {npc.weaknesses?.length > 0 ? npc.weaknesses.map(w => <span key={w.type} className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-bold font-label">{w.type} {w.value}</span>) : <span className="text-xs text-outline-variant">None</span>}
                </div>

                 <span className="text-[10px] text-secondary font-label uppercase block mb-1">Immunities:</span>
                 <InlineStringArray values={npc.immunities} collectionName="creatures" entityId={npc.id} fieldPath="immunities" isEditing={isEditing} pillClass="px-2 py-0.5 bg-surface-container-highest text-secondary text-[10px] font-bold font-label" />
              </div>
          </div>

          {/* Skills */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-3">Skills</h2>
             <InlineSkillMap skills={npc.skills} collectionName="creatures" entityId={npc.id} isEditing={isEditing} formatMod={formatMod} />
          </div>
          
          {/* Inventory */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-4">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest">Inventory / Loot</h2>
             </div>
             <InlineReferenceArray values={npc.items} collectionName="creatures" entityId={npc.id} fieldPath="items" isEditing={isEditing} referenceCollection="items" />
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
                {npc.attributes ? Object.entries(npc.attributes).map(([attr, val]) => (
                  <div key={attr} className="bg-surface-container-highest p-4 flex flex-col items-center">
                    <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-2">{attr}</span>
                    {isEditing ? (
                       <InlineEditable value={val} collectionName="creatures" entityId={npc.id} fieldPath={`attributes.${attr}`} isEditing={isEditing} type="number" className="text-2xl font-black font-headline text-primary" />
                    ) : (
                       <button onClick={() => rollDice(`${attr} Check`, val)} className="text-2xl font-black font-headline text-primary hover:bg-primary/20 px-2 rounded transition-colors cursor-pointer">{formatMod(val)}</button>
                    )}
                  </div>
                )) : <div className="col-span-6 text-center text-xs text-outline-variant italic py-4">No attributes documented.</div>}
             </div>
          </div>

          {/* Strikes & Attacks */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Offense: Strikes</h2>
             <InlineCreatureAttacks attacks={npc.attacks} entityId={npc.id} isEditing={isEditing} formatMod={formatMod} />
          </div>

          {/* Spellcasting & Special Abilities */}
          <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
             <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Capabilities & Spells</h2>
             <div className="space-y-6">

                {/* Special Abilities */}
                {npc.specialAbilities?.length > 0 && (
                   <div className="space-y-3">
                     {npc.specialAbilities.map((ability, i) => (
                        <div key={i} className="bg-surface p-4 border border-outline-variant/10">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="font-bold text-sm text-primary uppercase">{ability.name}</span>
                             <span className="px-2 py-0.5 bg-secondary/10 border border-secondary/30 text-[9px] font-bold font-label text-secondary uppercase">{ability.actionCost}</span>
                           </div>
                           <p className="text-xs text-secondary/90 leading-relaxed font-body">{ability.description}</p>
                        </div>
                     ))}
                   </div>
                )}

                {/* Spell Slots */}
                {npc.spellcasting?.spellSlots?.length > 0 && (
                  <div className="relative pl-8 mt-2">
                    <div className="absolute left-1.5 top-2 w-3 h-3 rounded-none bg-primary/20 border border-primary/50 rotate-45"></div>
                    <div className="bg-surface-container-highest p-4 border-l-2 border-primary">
                       <div className="flex items-center gap-4 mb-4">
                          <span className="font-bold text-xs font-label tracking-widest text-primary uppercase">
                             <InlineEditable value={npc.spellcasting.type} collectionName="creatures" entityId={npc.id} fieldPath="spellcasting.type" isEditing={isEditing} className="w-16 mx-1" /> 
                             Spells (<InlineEditable value={npc.spellcasting.tradition} collectionName="creatures" entityId={npc.id} fieldPath="spellcasting.tradition" isEditing={isEditing} className="w-20 mx-1" />)
                          </span>
                          <span className="text-[10px] font-bold text-secondary uppercase bg-surface px-2 py-1 border border-outline-variant/20 rounded flex items-center">
                             Attack: +<InlineEditable type="number" value={npc.spellcasting.attack} collectionName="creatures" entityId={npc.id} fieldPath="spellcasting.attack" isEditing={isEditing} className="w-6 mx-1" /> 
                             • DC <InlineEditable type="number" value={npc.spellcasting.dc} collectionName="creatures" entityId={npc.id} fieldPath="spellcasting.dc" isEditing={isEditing} className="w-6 mx-1" />
                          </span>
                       </div>
                       
                       <InlineCreatureSpells spellcasting={npc.spellcasting} entityId={npc.id} isEditing={isEditing} />
                    </div>
                  </div>
               )}
               
               {(!npc.specialAbilities?.length && !npc.spellcasting?.spellSlots?.length) && (
                  <span className="text-xs text-outline-variant italic">No capabilities documented.</span>
               )}

             </div>
          </div>

        </div>

      </div>

      <ConfirmModal 
          isOpen={isDeleteModalOpen}
          title="Delete Creature"
          message={`Are you sure you want to permanently delete ${npc.name}? This action cannot be undone.`}
          onConfirm={performDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
      />

    </main>
  );
}
