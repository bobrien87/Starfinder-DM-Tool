import React, { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from '../components/InlineEditable';
import InlineStringArray from '../components/InlineStringArray';
import ConfirmModal from '../components/ConfirmModal';
import InlinePlayerInventory from '../components/InlinePlayerInventory';
import InlinePlayerWeapons from '../components/InlinePlayerWeapons';
import InlineImmunityEditor from '../components/InlineImmunityEditor';
import InlineResistanceEditor from '../components/InlineResistanceEditor';
import InlineSenseEditor from '../components/InlineSenseEditor';
import InlineSpellcastingEditor from '../components/InlineSpellcastingEditor';
import InlineTraitSelectEditor from '../components/InlineTraitSelectEditor';
import InlineTraitValueEditor from '../components/InlineTraitValueEditor';
import SingleD20Icon from '../components/SingleD20Icon';
import InlineSkillEditor from '../components/InlineSkillEditor';
import StatPill from '../components/StatPill';
import StatCard from '../components/StatCard';
import { IMMUNITY_OPTIONS, RESISTANCE_WEAKNESS_OPTIONS } from '../data/defenses';
import { SENSES, LANGUAGES } from '../data/traits';
import { SPELL_TRADITIONS, GAME_SKILLS } from '../utils/constants';

export default function PlayerDetail() {
   const { id } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const { rollDice, rollDamage } = useDice();
   const { getEntity, encounters, deleteEntity, updateEntity } = useDatabase();
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
      <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-transparent flex flex-col gap-6">
         {/* Header */}
         <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
            <div className="flex items-end gap-6">
               <div>
                  <div className="flex items-center gap-4">
                     <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase w-auto min-w-[200px]">
                        <InlineEditable value={pc.characterName} collectionName="players" entityId={pc.id} fieldPath="characterName" isEditing={isEditing} />
                     </h1>
                  </div>
                  <div className="flex gap-2 mt-2 items-center">
                     <StatPill variant="secondary">
                        Level <InlineEditable value={pc.level} collectionName="players" entityId={pc.id} fieldPath="level" isEditing={isEditing} type="number" className="mx-1 max-w-[30px] inline-block" />
                     </StatPill>
                     <InlineStringArray values={pc.traits} collectionName="players" entityId={pc.id} fieldPath="traits" isEditing={isEditing} />
                  </div>
                  <p className="text-secondary font-label text-xs tracking-widest uppercase opacity-70 mt-1">
                     {pc.size} • {pc.heritage} {pc.ancestry} • Played by {pc.playerName}
                     <span className="ml-4 text-primary font-bold">Hero Points: {pc.heroPoints}</span>
                  </p>
               </div>
            </div>
            <div className="flex gap-4 items-center shrink-0">
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



               {/* Defenses */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Defenses</h2>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center relative">
                        <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">HP</span>
                        
                        <div className={`text-[1.4rem] font-black font-headline leading-none text-center flex items-baseline justify-center whitespace-nowrap ${pc.hp?.current / pc.hp?.max <= 0.5 ? 'text-error' : 'text-primary'}`}>
                           {hasActiveEncounter ? (
                              <span title="Locked: Modify inside Active Encounter" style={{ cursor: 'not-allowed' }} className="w-10 text-right inline-block">{pc.hp.current}</span>
                           ) : (
                              <div className="w-10 inline-block text-right">
                                 <InlineEditable value={pc.hp?.current} collectionName="players" entityId={pc.id} fieldPath="hp.current" isEditing={isEditing} type="number" className="text-right w-full" />
                              </div>
                           )}
                           <span className="text-base font-normal opacity-50 mx-1">/</span>
                           <div className="w-10 inline-block text-left opacity-80">
                              <InlineEditable value={pc.hp?.max} collectionName="players" entityId={pc.id} fieldPath="hp.max" isEditing={isEditing} type="number" className="text-left w-full" />
                           </div>
                        </div>

                        {pc.hp?.temp > 0 && (
                           <StatPill variant="positive" className="mt-2 tracking-widest">
                              +{pc.hp.temp} Temp
                           </StatPill>
                        )}
                        {hasActiveEncounter && isEditing && (
                           <div className="absolute top-1 right-1 text-error" title="Locked By Active Combat">
                              <span className="material-symbols-outlined text-[12px]" data-icon="lock">lock</span>
                           </div>
                        )}
                     </div>
                     <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                        <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">AC</span>
                        <div className="text-[1.4rem] font-black font-headline text-primary leading-none w-16 text-center">
                           <InlineEditable value={pc.ac} collectionName="players" entityId={pc.id} fieldPath="ac" isEditing={isEditing} type="number" className="text-center w-full" />
                        </div>
                     </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                     {['fortitude', 'reflex', 'will'].map(saveType => (
                        <div key={saveType} className="flex justify-between items-center">
                           {isEditing ? (
                              <React.Fragment>
                                 <span className="text-xs text-secondary font-bold uppercase">{saveType}</span>
                                 <div className="w-12"><InlineEditable value={pc.saves?.[saveType]} collectionName="players" entityId={pc.id} fieldPath={`saves.${saveType}`} isEditing={isEditing} type="number" className="text-lg font-black text-primary border-b-[1px] text-center" /></div>
                              </React.Fragment>
                           ) : (
                              <StatPill label={saveType} onClick={() => rollDice(`${saveType} Save`, pc.saves?.[saveType] || 0)}>{formatMod(pc.saves?.[saveType] || 0)}</StatPill>
                           )}
                        </div>
                     ))}
                  </div>

                  {(isEditing || pc.immunities?.length > 0 || pc.resistances?.length > 0 || pc.weaknesses?.length > 0) && (
                     <div className="border-t border-outline-variant/10 pt-4 mt-4">
                        {(isEditing || pc.immunities?.length > 0) && (
                           <div>
                              <span className="text-xs text-secondary block mb-1">Immunities:</span>
                              <InlineImmunityEditor
                                 values={pc.immunities}
                                 collectionName="players"
                                 entityId={pc.id}
                                 fieldPath="immunities"
                                 isEditing={isEditing}
                                 options={IMMUNITY_OPTIONS}
                              />
                           </div>
                        )}

                        {(isEditing || pc.resistances?.length > 0) && (
                           <div className="mt-4">
                              <span className="text-xs text-secondary block mb-1">Resistances:</span>
                              <InlineResistanceEditor
                                 values={pc.resistances}
                                 collectionName="players"
                                 entityId={pc.id}
                                 fieldPath="resistances"
                                 isEditing={isEditing}
                                 options={RESISTANCE_WEAKNESS_OPTIONS}
                                 variant="resistance"
                              />
                           </div>
                        )}

                        {(isEditing || pc.weaknesses?.length > 0) && (
                           <div className="mt-4">
                              <span className="text-xs text-secondary block mb-1">Weaknesses:</span>
                              <InlineResistanceEditor
                                 values={pc.weaknesses}
                                 collectionName="players"
                                 entityId={pc.id}
                                 fieldPath="weaknesses"
                                 isEditing={isEditing}
                                 options={RESISTANCE_WEAKNESS_OPTIONS}
                                 variant="weakness"
                              />
                           </div>
                        )}
                     </div>
                  )}
               </div>

               {/* Senses, Immunities & Weaknesses */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <div className="mb-4">
                     <div className="flex justify-between items-center">
                        {isEditing ? (
                           <React.Fragment>
                              <span className="text-xs text-secondary font-bold uppercase">Perception</span>
                              <div className="w-12"><InlineEditable value={pc.perception} collectionName="players" entityId={pc.id} fieldPath="perception" isEditing={isEditing} type="number" className="text-lg font-black text-primary border-b-[1px] text-center" /></div>
                           </React.Fragment>
                        ) : (
                           <StatPill label="Perception" onClick={() => rollDice('Perception', pc.perception)}>{formatMod(pc.perception)}</StatPill>
                        )}
                     </div>
                     <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-secondary uppercase font-bold">Class DC</span>
                        <span className="text-sm font-bold text-primary">{pc.classDC}</span>
                     </div>

                     <div className="mt-4 pt-4 border-t border-outline-variant/10">
                        <span className="text-xs text-secondary uppercase font-bold block mb-2">Senses</span>
                        <InlineSenseEditor values={pc.senses} collectionName="players" entityId={pc.id} fieldPath="senses" isEditing={isEditing} options={SENSES} />
                     </div>
                  </div>
               </div>

               {/* Attributes */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Attributes</h2>
                  <div className="grid grid-cols-3 gap-2">
                     {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((attr) => (
                        <StatCard 
                           key={attr}
                           label={attr}
                           value={pc.attributes?.[attr] || 0}
                           rollName={`${attr} Check`}
                           collectionName="players"
                           entityId={pc.id}
                           fieldPath={`attributes.${attr}`}
                           isEditing={isEditing}
                           rollDice={rollDice}
                        />
                     ))}
                  </div>
               </div>

               {/* Narrow Column Overflows (Skills/Attributes) */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Skills</h2>
                  <InlineSkillEditor skills={pc.skills} collectionName="players" entityId={pc.id} isEditing={isEditing} formatMod={formatMod} options={GAME_SKILLS} />
               </div>

               {/* Languages */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Languages</h2>
                  <InlineTraitSelectEditor values={pc.languages} collectionName="players" entityId={pc.id} fieldPath="languages" isEditing={isEditing} options={LANGUAGES} placeholder="Add language..." />
               </div>



            </div>

            {/* ======================= */}
            {/* RIGHT COLUMN (3/4 = col-span-9) */}
            {/* ======================= */}
            <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">

               {/* Speed */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Speed</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                     {['Land', 'Swim', 'Climb', 'Fly', 'Burrow'].map(speedType => {
                        let speedValue = '-';
                        if (pc.speeds && Array.isArray(pc.speeds)) {
                           const speedObj = pc.speeds.find(s => s.type?.toLowerCase() === speedType.toLowerCase());
                           if (speedObj) speedValue = speedObj.value;
                        } else if (speedType === 'Land' && pc.speed) {
                           const parsed = parseInt(pc.speed);
                           speedValue = isNaN(parsed) ? pc.speed : parsed;
                        }

                        const handleSpeedSave = async (val) => {
                           let newSpeeds = pc.speeds ? [...pc.speeds] : [];
                           const existingIdx = newSpeeds.findIndex(s => s.type?.toLowerCase() === speedType.toLowerCase());
                           if (existingIdx >= 0) {
                              if (val === 0 || val === '') newSpeeds.splice(existingIdx, 1);
                              else newSpeeds[existingIdx].value = val;
                           } else {
                              if (val !== 0 && val !== '') newSpeeds.push({ type: speedType, value: val });
                           }
                           await updateEntity('players', pc.id, { speeds: newSpeeds });
                        };

                        return (
                           <div key={speedType} className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                              <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">{speedType}</span>
                              <div className="text-3xl font-black font-headline text-primary leading-none text-center w-full">
                                 {isEditing ? (
                                    <InlineEditable
                                       type="number"
                                       value={speedValue === '-' ? '' : speedValue}
                                       isEditing={true}
                                       className="text-center w-full"
                                       onSave={handleSpeedSave}
                                    />
                                 ) : (
                                    speedValue !== '-' ? `${speedValue} ft` : '-'
                                 )}
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>

               {/* Attacks (formerly Strikes & Weapons) */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Attacks</h2>
                  <InlinePlayerWeapons weapons={pc.weapons} pc={pc} collectionName="players" entityId={pc.id} isEditing={isEditing} formatMod={formatMod} />
               </div>

               {/* Spellcasting */}
               <InlineSpellcastingEditor spellcasting={pc.spellcasting || []} collectionName="players" entityId={pc.id} entity={pc} isEditing={isEditing} />

               {/* Inventory */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-2">
                     <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest">Inventory</h2>
                     <span className="text-xs font-bold text-primary flex items-center">
                        <InlineEditable type="number" value={pc.credits || 0} collectionName="players" entityId={pc.id} fieldPath="credits" isEditing={isEditing} className="w-16 text-right mx-1 bg-surface-container border border-outline-variant/20 rounded" />
                        CR
                     </span>
                  </div>
                  <p className="text-xs text-secondary flex items-center">
                     <span className="font-bold mr-2">Armor:</span>
                     {isEditing ? (
                        <span className="opacity-50 text-[10px] italic">Edit armor through inventory</span>
                     ) : (
                        pc.armor?.name || 'Unarmored'
                     )}
                  </p>
                  <InlinePlayerInventory inventory={pc.inventory} collectionName="players" entityId={pc.id} isEditing={isEditing} />
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
