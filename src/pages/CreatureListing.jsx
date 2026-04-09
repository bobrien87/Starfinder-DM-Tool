import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { RARITY_COLORS } from '../utils/constants';
import StatPill from '../components/StatPill';
import Button from '../components/Button';
import CustomMultiSelect from '../components/CustomMultiSelect';
import CustomSelect from '../components/CustomSelect';

export default function CreatureListing() {
  const { creatures, createEntity, deleteEntity } = useDatabase();
  const navigate = useNavigate();

  const [filterTraits, setFilterTraits] = useState([]);
  const [filterRarity, setFilterRarity] = useState('Any');
  const [filterLevelMin, setFilterLevelMin] = useState('');
  const [filterLevelMax, setFilterLevelMax] = useState('');

  const handleCreate = async () => {
    const docRef = await createEntity('creatures', { 
        name: "New Creature", 
        level: 1, 
        traits: [],
        hp: { current: 15, max: 15 },
        ac: 15,
        saves: { fortitude: 0, reflex: 0, will: 0 }
    });
    navigate(`/creatures/${docRef.id}`, { state: { edit: true } });
  };

  const handleImportFoundrySF2E = async () => {
      if (!window.confirm("Import 5 official Starfinder 2e monsters directly from Foundry VTT's GitHub data?")) return;
      const samples = [
        {
          "name": "Aeon Guard Trooper",
          "level": 3,
          "rarity": "Common",
          "traits": [ "human", "humanoid" ],
          "hp": { "current": 45, "max": 45 },
          "ac": 20,
          "saves": { "fortitude": 12, "reflex": 9, "will": 6 },
          "attacks": [
            { "name": "Tactical Baton", "bonus": 10, "damage": "1d4+4 bludgeoning", "traits": [ "agile", "analog", "nonlethal", "operative" ] },
            { "name": "Fist", "bonus": 10, "damage": "1d4+4 bludgeoning", "traits": [ "agile", "nonlethal", "unarmed" ] },
            { "name": "Azlanti Laser Rifle", "bonus": 12, "damage": "1d8+4 fire", "traits": [ "tech" ] },
            { "name": "Frag Grenade I", "bonus": 10, "damage": "1d6 piercing", "traits": [ "analog", "radial", "thrown-20" ] }
          ]
        },
        {
          "name": "Akata",
          "level": 1,
          "rarity": "Common",
          "traits": [ "aberration" ],
          "hp": { "current": 18, "max": 18 },
          "ac": 16,
          "saves": { "fortitude": 9, "reflex": 7, "will": 4 },
          "attacks": [
            { "name": "Jaws", "bonus": 9, "damage": "1d6+4 piercing", "traits": [] },
            { "name": "Tentacle", "bonus": 9, "damage": "1d6+4 piercing", "traits": [ "agile", "unarmed" ] }
          ]
        },
        {
          "name": "Assembly Ooze",
          "level": 1,
          "rarity": "Common",
          "traits": [ "mindless", "ooze", "tech" ],
          "hp": { "current": 54, "max": 54 },
          "ac": 11,
          "saves": { "fortitude": 12, "reflex": 1, "will": 4 },
          "attacks": [
            { "name": "Pseudopod", "bonus": 9, "damage": "1d6 bludgeoning + 1d4 acid", "traits": [] }
          ]
        },
        {
          "name": "Barachius Angel",
          "level": 7,
          "rarity": "Common",
          "traits": [ "angel", "celestial", "holy" ],
          "hp": { "current": 113, "max": 113 },
          "ac": 24,
          "saves": { "fortitude": 15, "reflex": 12, "will": 17 },
          "attacks": [
            { "name": "Laser Rifle", "bonus": 18, "damage": "2d8 fire + 1d8 spirit", "traits": [ "tech", "tracking-1" ] },
            { "name": "Dueling Sword", "bonus": 16, "damage": "1d8 spirit + 2d8+2 slashing", "traits": [ "analog", "tracking-1", "versatile-p" ] },
            { "name": "Digital Dagger", "bonus": 18, "damage": "2d4+2 piercing + 1d8 spirit", "traits": [ "agile", "finesse" ] }
          ]
        },
        {
          "name": "Diatha",
          "level": -1,
          "rarity": "Common",
          "traits": [ "animal", "mindless" ],
          "hp": { "current": 10, "max": 10 },
          "ac": 14,
          "saves": { "fortitude": 8, "reflex": 5, "will": 2 },
          "attacks": [
            { "name": "Bite", "bonus": 6, "damage": "1d4+1 piercing + 1 fire", "traits": [ "agile", "finesse" ] }
          ]
        }
      ];
      for (const c of samples) { await createEntity('creatures', c); }
  };

  const handleDeleteAll = async () => {
      if (!window.confirm("Are you sure you want to PERMANENTLY delete ALL Creatures?")) return;
      for (const c of creatures) { await deleteEntity('creatures', c.id); }
  };

  const filteredCreatures = (creatures || []).filter(c => {
      // Level Range
      const minLevel = filterLevelMin !== '' ? Number(filterLevelMin) : -10;
      const maxLevel = filterLevelMax !== '' ? Number(filterLevelMax) : 30;
      const lvl = c.level || 0;
      if (lvl < minLevel || lvl > maxLevel) return false;

      // Trait Search (AND logic)
      if (filterTraits.length > 0) {
          const hasAllTraits = filterTraits.every(t => c.traits?.some(ct => ct.toLowerCase() === t.toLowerCase()));
          if (!hasAllTraits) return false;
      }

      // Rarity
      if (filterRarity !== 'Any') {
          // Assume rarity is stored in c.rarity, or as a trait. If missing, assume Common.
          const isCommon = !c.rarity && !c.traits?.some(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()));
          const actualRarity = c.rarity ? c.rarity.toLowerCase() : (isCommon ? 'common' : c.traits?.find(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()))?.toLowerCase() || 'common');
          
          if (actualRarity !== filterRarity.toLowerCase()) return false;
      }

      return true;
  }).sort((a,b) => (a.level || 0) - (b.level || 0));

  return (
    <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-transparent flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase">Creatures</h1>
          <p className="text-secondary font-label text-xs tracking-widest uppercase opacity-70">NPCs, Aliens, and Hazards</p>
        </div>
        <div className="flex gap-4 items-center">
           <Button variant="danger" onClick={handleDeleteAll}>Delete All</Button>
           <Button variant="secondary" onClick={handleImportFoundrySF2E}>Import Structured Foundry Data</Button>
           <Button variant="primary" onClick={handleCreate}>Create Custom</Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 bg-surface-container-low p-4 border border-outline-variant/10 shrink-0 relative z-20">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] text-secondary font-bold uppercase tracking-widest">Rarity</label>
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
          <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[250px]">
              <label className="text-[10px] text-secondary font-bold uppercase tracking-widest">Filter by Traits</label>
              <CustomMultiSelect 
                  value={filterTraits} 
                  onChange={setFilterTraits} 
                  options={Array.from(new Set((creatures || []).flatMap(c => c.traits || []))).sort()}
                  placeholder="e.g. humanoid, swarm..."
              />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] text-secondary font-bold uppercase tracking-widest">Level Range</label>
              <div className="flex items-center gap-2">
                 <input 
                    type="number" 
                    value={filterLevelMin}
                    onChange={e => setFilterLevelMin(e.target.value)}
                    placeholder="Min"
                    className="bg-surface-container-lowest border border-outline-variant/30 text-xs px-2 h-8 text-primary focus:border-primary/50 outline-none w-16 text-center"
                 />
                 <span className="text-secondary text-xs">-</span>
                 <input 
                    type="number" 
                    value={filterLevelMax}
                    onChange={e => setFilterLevelMax(e.target.value)}
                    placeholder="Max"
                    className="bg-surface-container-lowest border border-outline-variant/30 text-xs px-2 h-8 text-primary focus:border-primary/50 outline-none w-16 text-center"
                 />
              </div>
          </div>
      </div>

      <div className="flex flex-col gap-3 min-h-0">
        {filteredCreatures.map((c) => {
          const isCommon = !c.rarity && !c.traits?.some(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()));
          const actualRarity = c.rarity ? c.rarity : (isCommon ? 'Common' : c.traits?.find(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase())) || 'Common');
          const rarityLower = actualRarity.toLowerCase();
          
          let rarityColor = RARITY_COLORS[rarityLower] || RARITY_COLORS.common;

          return (
          <Link to={`/creatures/${c.id}`} key={c.id} className="corner-cut bg-surface-container-high p-4 border-l-2 border-primary relative flex items-center justify-between gap-6 group hover:bg-surface-container-highest transition-colors cursor-pointer block shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent"></div>


            <div className="flex-1 flex flex-wrap items-center gap-4">
              <h3 className="text-xl font-black font-headline text-primary tracking-tight uppercase leading-none group-hover:text-white transition-colors">{c.name}</h3>
              <StatPill variant="custom" size="xs" className={`${rarityColor} border`}>{actualRarity}</StatPill>
              <StatPill size="xs">{c.type || 'Unknown'}</StatPill>
              {c.traits?.filter(t => !['common', 'uncommon', 'rare', 'unique'].includes(t.toLowerCase())).map((t, i) => <StatPill key={i} size="xs">{t}</StatPill>)}
            </div>

            <div className="text-center pr-6 border-r border-outline-variant/20 hidden sm:flex flex-col items-center justify-center">
               <span className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest leading-none mb-1">Level</span>
               <span className="text-xl font-black font-headline text-primary leading-none" title="Level">{c.level}</span>
            </div>
            
            <div className="pl-2">
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors text-[24px]" data-icon="chevron_right">chevron_right</span>
            </div>
          </Link>
        )})}
        {filteredCreatures.length === 0 && (
            <div className="p-8 text-center text-xs text-outline-variant italic border border-outline-variant/10 bg-surface-container-low">
                No creatures found matching your criteria.
            </div>
        )}
      </div>
    </main>
  );
}
