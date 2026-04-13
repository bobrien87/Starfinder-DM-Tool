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
import StatList from '../components/StatList';
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
  return <div className="p-8 text-primary tracking-widest text-center">Data Matrix Loading... or Entity Not Found.</div>;
  }

  return (
   <main className="page-layout-wrapper">
     {/* Header */}
     <div className="flex justify-between items-end border-b pb-4 border-tertiary/30">
      <div className="flex items-end gap-6">
        <div>
         <div className="flex items-center gap-4">
           <h1 className="w-auto min-w-[200px]">
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
         <button onClick={() => setIsDeleteModalOpen(true)} className="w-8 h-8 rounded border border-accent-yellow/40 text-accent-yellow flex items-center justify-center hover:bg-accent-yellow/10 transition-colors" title="Delete Creature">
           <span className="material-symbols-outlined text-[18px]">delete</span>
         </button>
        ) : (
         <Link to="/creatures" className="w-8 h-8 rounded border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors" title="Back">
           <span className="material-symbols-outlined text-[18px]">chevron_left</span>
         </Link>
        )}
        <button
         onClick={() => setIsEditing(!isEditing)}
     className={`px-6 h-8 flex items-center border font-label text-xs tracking-widest transition-all ${isEditing ? 'bg-secondary text-black border-secondary hover:bg-secondary/80' : 'border-primary/40 text-primary hover:bg-primary/10'}`}>
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
        <div className="border border-outline-variant/10 p-4">
         <h3>Defenses</h3>
         <div className="grid grid-cols-2 gap-4">
           <div className="p-4 border border-outline-variant/20 flex flex-col items-center">
      <span className="text-[12px] font-label text-primary opacity-60 mb-1">HP</span>
            <div className="text-[1.4rem] font-headline text-primary leading-none w-16 text-center">
              <InlineEditable value={npc.hp?.max} collectionName="creatures" entityId={npc.id} fieldPath="hp.max" isEditing={isEditing} type="number" className="text-center w-full" />
            </div>
           </div>
           <div className="p-4 border border-outline-variant/20 flex flex-col items-center">
      <span className="text-[12px] font-label text-primary opacity-60 mb-1">AC</span>
            <div className="text-[1.4rem] font-headline text-primary leading-none w-16 text-center">
              <InlineEditable value={npc.ac} collectionName="creatures" entityId={npc.id} fieldPath="ac" isEditing={isEditing} type="number" className="text-center w-full" />
            </div>
           </div>
         </div>

         <div className="mt-4 flex flex-col gap-2">
           {['fortitude', 'reflex', 'will'].map(saveType => (
            <StatList 
              key={saveType}
              label={saveType}
              value={npc.saves?.[saveType] || 0}
              rollName={`${saveType} Save`}
              collectionName="creatures"
              entityId={npc.id}
              fieldPath={`saves.${saveType}`}
              isEditing={isEditing}
              rollDice={rollDice}
            />
           ))}
         </div>

         {(isEditing || npc.immunities?.length > 0 || npc.resistances?.length > 0 || npc.weaknesses?.length > 0) && (
           <div className="border-t pt-4 mt-4 border-tertiary/30">
            {(isEditing || npc.immunities?.length > 0) && (
              <div>
        <span className="text-[12px] text-primary font-label block mb-1">Immunities:</span>
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
        <span className="text-[12px] text-primary font-label block mb-1">Resistances:</span>
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
        <span className="text-[12px] text-primary font-label block mb-1">Weaknesses:</span>
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
        <div className="border border-outline-variant/10 p-4">
         <div className="mb-4">
           <div className="flex justify-between items-center">
            {isEditing ? (
              <React.Fragment>
        <span className="text-xs text-primary ">Perception</span>
               <div className="w-12"><InlineEditable value={npc.perception} collectionName="creatures" entityId={npc.id} fieldPath="perception" isEditing={isEditing} type="number" className="text-lg text-primary border-b-[1px] text-center border-tertiary/30" /></div>
              </React.Fragment>
            ) : (
              <StatPill label="Perception" onClick={() => rollDice('Perception', npc.perception || 0)}>{formatMod(npc.perception || 0)}</StatPill>
            )}
           </div>
         </div>
         <div className="mt-4 pt-4 border-t border-tertiary/30">
      <span className="text-[12px] text-primary font-label block mb-2">Senses</span>
           <InlineSenseEditor values={npc.senses} collectionName="creatures" entityId={npc.id} fieldPath="senses" isEditing={isEditing} options={SENSES} />
         </div>
        </div>

        {/* Attributes */}
        <div className="border border-outline-variant/10 p-4">
         <h3>Attributes</h3>
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
        <div className="border border-outline-variant/10 p-4">
         <h3>Skills</h3>
         <InlineSkillEditor skills={npc.skills} collectionName="creatures" entityId={npc.id} isEditing={isEditing} formatMod={formatMod} options={GAME_SKILLS} />
        </div>

        {/* Languages */}
        <div className="border border-outline-variant/10 p-4">
         <h3>Languages</h3>
         <InlineTraitSelectEditor values={npc.languages} collectionName="creatures" entityId={npc.id} fieldPath="languages" isEditing={isEditing} options={LANGUAGES} placeholder="Add language..." />
        </div>

        {/* Inventory */}
        <div className="border border-outline-variant/10 p-4">
         <h3>Inventory</h3>
         <InlineReferenceArray values={npc.items} collectionName="creatures" entityId={npc.id} fieldPath="items" isEditing={isEditing} referenceCollection="items" />
        </div>

      </div>

      {/* ======================= */}
      {/* RIGHT COLUMN (3/4 = col-span-9) */}
      {/* ======================= */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">

        {/* Speed */}
        <div className="border border-outline-variant/10 p-4">
         <h3>Speed</h3>
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

            const isSwimOrClimb = speedType === 'Swim' || speedType === 'Climb';
            const isMissing = speedValue === '-';
            const isInteractive = !isEditing && isSwimOrClimb && isMissing;
            const Component = isInteractive ? 'button' : 'div';

            const getAthleticsScore = () => {
              const val = Object.entries(npc.skills || {}).find(([k,v]) => k.toLowerCase() === 'athletics');
              return val ? val[1] : (npc.attributes?.str || 0);
            };

            const handleRoll = () => {
              if (isInteractive) {
               rollDice(`${speedType} (Athletics) Check`, getAthleticsScore());
              }
            };

            return (
              <Component 
               key={speedType} 
               className={`p-4 flex flex-col items-center border transition-colors group ${isInteractive ? 'border-outline-variant/20 hover:bg-primary/20 hover:border-primary/50 cursor-pointer' : 'border-outline-variant/20'}`}
               onClick={isInteractive ? handleRoll : undefined}
               type={isInteractive ? "button" : undefined}
              >
        <span className={`text-[12px] font-label opacity-60 mb-1 transition-colors ${isInteractive ? 'text-primary group-hover:text-primary' : 'text-primary'}`}>{speedType}</span>
               <div className={`text-[1.4rem] font-headline leading-none text-center whitespace-nowrap flex items-center justify-center transition-colors ${isInteractive ? 'text-primary group-hover:text-white' : 'text-primary'}`}>
                 {isEditing ? (
                  <InlineEditable
                    type="number"
                    value={speedValue === '-' ? '' : speedValue}
                    isEditing={true}
                    className="text-center w-full"
                    onSave={handleSpeedSave}
                  />
                 ) : (
                  isInteractive ? <SingleD20Icon className="w-5 h-5 group-hover:animate-spin opacity-80 shrink-0" /> : (speedValue !== '-' ? `${speedValue} ft` : '-')
                 )}
               </div>
              </Component>
            )
           })}
         </div>
        </div>

        {/* Attacks */}
        {(isEditing || (npc.attacks && npc.attacks.length > 0)) && (
          <div className="border border-outline-variant/10 p-6 flex flex-col gap-4">
           <h3>Attacks</h3>
           <InlineCreatureAttacks attacks={npc.attacks} entityId={npc.id} isEditing={isEditing} formatMod={formatMod} />
          </div>
        )}

        {/* Actions */}
        {(isEditing || (npc.actions && npc.actions.length > 0)) && (
          <div className="border border-outline-variant/10 p-6 flex flex-col gap-4">
           <h3>Actions</h3>
           <InlineCreatureAbilities abilities={npc.actions} type="action" entityId={npc.id} isEditing={isEditing} />
          </div>
        )}

        {/* Passives */}
        {(isEditing || (npc.passives && npc.passives.length > 0)) && (
          <div className="border border-outline-variant/10 p-6 flex flex-col gap-4">
           <h3>Passives</h3>
           <InlineCreatureAbilities abilities={npc.passives} type="passive" entityId={npc.id} isEditing={isEditing} />
          </div>
        )}

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
