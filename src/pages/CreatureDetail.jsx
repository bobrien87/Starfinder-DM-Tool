import React, { useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDice } from '../context/DiceContext';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from '../components/InlineEditable';
import InlineStringArray from '../components/InlineStringArray';
import ConfirmModal from '../components/ConfirmModal';
import InlineCreatureAttacks from '../components/InlineCreatureAttacks';
import InlineReferenceArray from '../components/InlineReferenceArray';
import InlineSpellcastingEditor from '../components/InlineSpellcastingEditor';
import InlineTraitSelectEditor from '../components/InlineTraitSelectEditor';
import InlineImmunityEditor from '../components/InlineImmunityEditor';
import InlineCreatureAbilities from '../components/InlineCreatureAbilities';
import SingleD20Icon from '../components/SingleD20Icon';
import InlineResistanceEditor from '../components/InlineResistanceEditor';
import InlineSenseEditor from '../components/InlineSenseEditor';
import InlineSkillEditor from '../components/InlineSkillEditor';
import StatPill from '../components/StatPill';
import StatCard from '../components/StatCard';
import { IMMUNITY_OPTIONS, RESISTANCE_WEAKNESS_OPTIONS } from '../data/defenses';
import { SENSES, LANGUAGES } from '../data/traits';
import { RARITY_COLORS, ABILITY_TRAITS, GAME_SKILLS } from '../utils/constants';

export default function CreatureDetail() {
   const { id } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const { rollDice, rollDamage } = useDice();
   const { getEntity, deleteEntity, updateEntity } = useDatabase();
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
      <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-transparent flex flex-col gap-6">
         {/* Header */}
         <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
            <div className="flex items-end gap-6">
               <div>
                  <div className="flex items-center gap-4">
                     <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase w-auto min-w-[200px]">
                        <InlineEditable value={npc.name} collectionName="creatures" entityId={npc.id} fieldPath="name" isEditing={isEditing} />
                     </h1>
                  </div>
                  <div className="flex gap-2 mt-2 items-center">
                     <StatPill variant="secondary">
                        Creature <InlineEditable value={npc.level} collectionName="creatures" entityId={npc.id} fieldPath="level" isEditing={isEditing} type="number" className="mx-1 max-w-[30px] inline-block" />
                     </StatPill>
                     <InlineStringArray values={npc.traits} collectionName="creatures" entityId={npc.id} fieldPath="traits" isEditing={isEditing} />
                  </div>
               </div>
            </div>
            <div className="flex gap-4 items-center shrink-0">
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
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Defenses</h2>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                        <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">HP</span>
                        <div className="text-[1.4rem] font-black font-headline text-primary leading-none w-16 text-center">
                           <InlineEditable value={npc.hp?.max} collectionName="creatures" entityId={npc.id} fieldPath="hp.max" isEditing={isEditing} type="number" className="text-center w-full" />
                        </div>
                     </div>
                     <div className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                        <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">AC</span>
                        <div className="text-[1.4rem] font-black font-headline text-primary leading-none w-16 text-center">
                           <InlineEditable value={npc.ac} collectionName="creatures" entityId={npc.id} fieldPath="ac" isEditing={isEditing} type="number" className="text-center w-full" />
                        </div>
                     </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                     {['fortitude', 'reflex', 'will'].map(saveType => (
                        <div key={saveType} className="flex justify-between items-center">
                           {isEditing ? (
                              <React.Fragment>
                                 <span className="text-xs text-secondary font-bold uppercase">{saveType}</span>
                                 <div className="w-12"><InlineEditable value={npc.saves?.[saveType]} collectionName="creatures" entityId={npc.id} fieldPath={`saves.${saveType}`} isEditing={isEditing} type="number" className="text-lg font-black text-primary border-b-[1px] text-center" /></div>
                              </React.Fragment>
                           ) : (
                              <StatPill label={saveType} onClick={() => rollDice(`${saveType} Save`, npc.saves?.[saveType] || 0)}>{formatMod(npc.saves?.[saveType] || 0)}</StatPill>
                           )}
                        </div>
                     ))}
                  </div>

                  {(isEditing || npc.immunities?.length > 0 || npc.resistances?.length > 0 || npc.weaknesses?.length > 0) && (
                     <div className="border-t border-outline-variant/10 pt-4 mt-4">
                        {(isEditing || npc.immunities?.length > 0) && (
                           <div>
                              <span className="text-[10px] text-secondary font-label uppercase block mb-1">Immunities:</span>
                              <InlineImmunityEditor
                                 values={npc.immunities}
                                 collectionName="creatures"
                                 entityId={npc.id}
                                 fieldPath="immunities"
                                 isEditing={isEditing}
                                 options={IMMUNITY_OPTIONS}
                              />
                           </div>
                        )}

                        {(isEditing || npc.resistances?.length > 0) && (
                           <div className="mt-4">
                              <span className="text-[10px] text-secondary font-label uppercase block mb-1">Resistances:</span>
                              <InlineResistanceEditor
                                 values={npc.resistances}
                                 collectionName="creatures"
                                 entityId={npc.id}
                                 fieldPath="resistances"
                                 isEditing={isEditing}
                                 options={RESISTANCE_WEAKNESS_OPTIONS}
                                 variant="resistance"
                              />
                           </div>
                        )}

                        {(isEditing || npc.weaknesses?.length > 0) && (
                           <div className="mt-4">
                              <span className="text-[10px] text-secondary font-label uppercase block mb-1">Weaknesses:</span>
                              <InlineResistanceEditor
                                 values={npc.weaknesses}
                                 collectionName="creatures"
                                 entityId={npc.id}
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
                              <div className="w-12"><InlineEditable value={npc.perception} collectionName="creatures" entityId={npc.id} fieldPath="perception" isEditing={isEditing} type="number" className="text-lg font-black text-primary border-b-[1px] text-center" /></div>
                           </React.Fragment>
                        ) : (
                           <StatPill label="Perception" onClick={() => rollDice('Perception', npc.perception || 0)}>{formatMod(npc.perception || 0)}</StatPill>
                        )}
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                     <span className="text-[10px] text-secondary font-label uppercase block mb-2">Senses</span>
                     <InlineSenseEditor values={npc.senses} collectionName="creatures" entityId={npc.id} fieldPath="senses" isEditing={isEditing} options={SENSES} />
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
                           value={npc.attributes?.[attr] || 0}
                           rollName={`${attr} Check`}
                           collectionName="creatures"
                           entityId={npc.id}
                           fieldPath={`attributes.${attr}`}
                           isEditing={isEditing}
                           rollDice={rollDice}
                        />
                     ))}
                  </div>
               </div>

               {/* Skills */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Skills</h2>
                  <InlineSkillEditor skills={npc.skills} collectionName="creatures" entityId={npc.id} isEditing={isEditing} formatMod={formatMod} options={GAME_SKILLS} />
               </div>

               {/* Languages */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Languages</h2>
                  <InlineTraitSelectEditor values={npc.languages} collectionName="creatures" entityId={npc.id} fieldPath="languages" isEditing={isEditing} options={LANGUAGES} placeholder="Add language..." />
               </div>

               {/* Inventory */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-4">Inventory</h2>
                  <InlineReferenceArray values={npc.items} collectionName="creatures" entityId={npc.id} fieldPath="items" isEditing={isEditing} referenceCollection="items" />
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
                        if (npc.speeds && Array.isArray(npc.speeds)) {
                           const speedObj = npc.speeds.find(s => s.type?.toLowerCase() === speedType.toLowerCase());
                           if (speedObj) speedValue = speedObj.value;
                        }

                        const handleSpeedSave = async (val) => {
                           let newSpeeds = npc.speeds ? [...npc.speeds] : [];
                           const existingIdx = newSpeeds.findIndex(s => s.type?.toLowerCase() === speedType.toLowerCase());
                           if (existingIdx >= 0) {
                              if (val === 0 || val === '') newSpeeds.splice(existingIdx, 1);
                              else newSpeeds[existingIdx].value = val;
                           } else {
                              if (val !== 0 && val !== '') newSpeeds.push({ type: speedType, value: val });
                           }
                           await updateEntity('creatures', npc.id, { speeds: newSpeeds });
                        };

                        return (
                           <div key={speedType} className="bg-surface-container-lowest p-4 border border-outline-variant/20 flex flex-col items-center">
                              <span className="text-[10px] font-label text-secondary uppercase opacity-60 mb-1">{speedType}</span>
                              <div className="text-[1.4rem] font-black font-headline text-primary leading-none text-center whitespace-nowrap">
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

               {/* Attacks */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Attacks</h2>
                  <InlineCreatureAttacks attacks={npc.attacks} entityId={npc.id} isEditing={isEditing} formatMod={formatMod} />
               </div>

               {/* Actions */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Actions</h2>
                  <InlineCreatureAbilities abilities={npc.actions} type="action" entityId={npc.id} isEditing={isEditing} />
               </div>

               {/* Passives */}
               <div className="bg-surface-container-low border border-outline-variant/10 p-6 flex flex-col gap-4">
                  <h2 className="text-xs font-bold font-label text-secondary uppercase tracking-widest mb-2">Passives</h2>
                  <InlineCreatureAbilities abilities={npc.passives} type="passive" entityId={npc.id} isEditing={isEditing} />
               </div>

               {/* Spells */}
               <InlineSpellcastingEditor spellcasting={npc.spellcasting} collectionName="creatures" entityId={npc.id} entity={npc} isEditing={isEditing} />

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
