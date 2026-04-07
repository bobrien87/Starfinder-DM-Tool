import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { RARITY_COLORS } from '../utils/constants';
import Button from '../components/Button';
import CustomSelect from '../components/CustomSelect';
import TraitFilterInput from '../components/TraitFilterInput';

export default function ItemListing() {
  const { items, createEntity, deleteEntity } = useDatabase();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('Any');
  const [filterRarity, setFilterRarity] = useState('Any');
  const [filterTraits, setFilterTraits] = useState([]);
  const [filterLevelMin, setFilterLevelMin] = useState('');
  const [filterLevelMax, setFilterLevelMax] = useState('');
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');

  const handleCreate = async () => {
    const docRef = await createEntity('items', { 
        name: "New Item", 
        level: 1, 
        type: "Weapon",
        bulk: "L",
        price: 100,
        description: "",
        traits: [],
        weaponData: {
          damage: "1d6 P",
          category: "Simple",
          group: "Projectile",
          range: "30 ft.",
          capacity: 10,
          usage: 1,
          reload: "1 Use"
        }
    });
    navigate(`/items/${docRef.id}`, { state: { edit: true } });
  };

  const handleImportFoundrySF2E = async () => {
      if (!window.confirm("Import 5 sample official Starfinder 2e Items directly from Foundry VTT's GitHub data?")) return;
      const samples = [
        {
          "name": "Azlanti Laser Rifle",
          "level": 3,
          "type": "Weapon",
          "bulk": "1",
          "price": 500,
          "description": "Standard issue Azlanti energy weapon.",
          "traits": ["Tech"],
          "weaponData": {
             "damage": "1d8 F",
             "category": "Martial",
             "group": "Laser",
             "range": "80 ft.",
             "capacity": 20,
             "usage": 2,
             "reload": "1 Interact"
          }
        },
        {
          "name": "Second Skin",
          "level": 1,
          "type": "Armor",
          "bulk": "L",
          "price": 25,
          "description": "Thin protective jumpsuit.",
          "traits": ["Tech"],
          "armorData": {
            "acBonus": 1,
            "dexCap": 5,
            "strengthReq": 0,
            "speedPenalty": 0
          }
        },
        {
          "name": "Tactical Baton",
          "level": 1,
          "type": "Weapon",
          "bulk": "L",
          "price": 90,
          "description": "Standard analog baton.",
          "traits": ["Agile", "Analog", "Nonlethal", "Operative"],
          "weaponData": {
             "damage": "1d4 B",
             "category": "Simple",
             "group": "Club",
             "range": "Melee",
             "capacity": 0,
             "usage": 0,
             "reload": "-"
          }
        },
        {
          "name": "Healing Serum",
          "level": 1,
          "type": "Consumable",
          "bulk": "L",
          "price": 50,
          "description": "Restores 1d8 HP.",
          "traits": ["Magical", "Healing", "Consumable"]
        },
        {
          "name": "Engineering Kit",
          "level": 1,
          "type": "Gear",
          "bulk": "1",
          "price": 20,
          "description": "Tools required to repair technological devices.",
          "traits": ["Tech"]
        }
      ];
      for (const i of samples) { await createEntity('items', i); }
  };

  const handleDeleteAll = async () => {
      if (!window.confirm("Are you sure you want to PERMANENTLY delete ALL Items?")) return;
      for (const i of items) { await deleteEntity('items', i.id); }
  };

  const filteredItems = (items || []).filter(i => {
      const minLevel = filterLevelMin !== '' ? Number(filterLevelMin) : -10;
      const maxLevel = filterLevelMax !== '' ? Number(filterLevelMax) : 30;
      if (typeof i.level === 'number' && (i.level < minLevel || i.level > maxLevel)) return false;
      
      const minPrice = filterPriceMin !== '' ? Number(filterPriceMin) : -1;
      const maxPrice = filterPriceMax !== '' ? Number(filterPriceMax) : 99999999;
      if (typeof i.price === 'number' && (i.price < minPrice || i.price > maxPrice)) return false;

      if (filterType && filterType !== 'Any' && i.type !== filterType) return false;
      
      if (filterRarity !== 'Any') {
          const isCommon = !i.rarity && !i.traits?.some(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()));
          const actualRarity = i.rarity ? i.rarity.toLowerCase() : (isCommon ? 'common' : i.traits?.find(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()))?.toLowerCase() || 'common');
          if (actualRarity !== filterRarity.toLowerCase()) return false;
      }
      
      if (filterTraits.length > 0) {
          const hasAllTraits = filterTraits.every(t => i.traits?.some(it => it.toLowerCase() === t.toLowerCase()));
          if (!hasAllTraits) return false;
      }
      return true;
  }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  return (
    <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-surface flex flex-col gap-6">
      <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase">Items</h1>
          <p className="text-secondary font-label text-xs tracking-widest uppercase opacity-70">Weapons, Armor, Gear, & Upgrades</p>
        </div>
        <div className="flex gap-4 items-center">
           <button onClick={handleDeleteAll} className="w-8 h-8 rounded border border-error/40 text-error flex items-center justify-center hover:bg-error/10 transition-colors" title="Delete All Items">
             <span className="material-symbols-outlined text-[18px]">delete</span>
           </button>
           <Button variant="secondary" onClick={handleImportFoundrySF2E}>Import Sample Data</Button>
           <Button variant="primary" onClick={handleCreate}>Create Item</Button>
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
          <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] text-secondary font-bold uppercase tracking-widest">Type</label>
              <CustomSelect 
                 value={filterType}
                 onChange={setFilterType}
                 options={[
                     { label: 'Any', value: 'Any' },
                     { label: 'Weapon', value: 'Weapon' },
                     { label: 'Armor', value: 'Armor' },
                     { label: 'Gear', value: 'Gear' },
                     { label: 'Consumable', value: 'Consumable' }
                 ]}
                 className="w-full sm:min-w-[120px]"
              />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[250px]">
              <label className="text-[10px] text-secondary font-bold uppercase tracking-widest">Filter by Traits</label>
              <TraitFilterInput 
                  selectedTraits={filterTraits} 
                  onChange={setFilterTraits} 
                  availableTraits={Array.from(new Set((items || []).flatMap(i => i.traits || []))).sort()} 
              />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[10px] text-secondary font-bold uppercase tracking-widest">Price Range</label>
              <div className="flex items-center gap-2">
                 <input 
                    type="number" 
                    value={filterPriceMin}
                    onChange={e => setFilterPriceMin(e.target.value)}
                    placeholder="Min"
                    className="bg-surface-container-lowest border border-outline-variant/30 text-xs px-2 h-8 text-primary focus:border-primary/50 outline-none w-16 text-center"
                 />
                 <span className="text-secondary text-xs">-</span>
                 <input 
                    type="number" 
                    value={filterPriceMax}
                    onChange={e => setFilterPriceMax(e.target.value)}
                    placeholder="Max"
                    className="bg-surface-container-lowest border border-outline-variant/30 text-xs px-2 h-8 text-primary focus:border-primary/50 outline-none w-16 text-center"
                 />
              </div>
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

      {/* ITEM LIST */}
      <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto pr-2 pb-2">
        {filteredItems.map((i) => {
          const isCommon = !i.rarity && !i.traits?.some(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase()));
          const actualRarity = i.rarity ? i.rarity : (isCommon ? 'Common' : i.traits?.find(t => ['uncommon', 'rare', 'unique'].includes(t.toLowerCase())) || 'Common');
          const rarityLower = actualRarity.toLowerCase();
          const rarityColor = RARITY_COLORS[rarityLower] || RARITY_COLORS.common;
          const filteredTargetTraits = (i.traits || []).filter(t => !['common', 'uncommon', 'rare', 'unique'].includes(t.toLowerCase()));

          return (
          <Link to={`/items/${i.id}`} key={i.id} className="corner-cut bg-surface-container-high p-4 border-l-2 border-primary relative flex items-center justify-between gap-6 group hover:bg-surface-container-highest transition-colors cursor-pointer block shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
            
            <div className="flex-1 flex flex-wrap items-center gap-4">
                <h3 className="text-xl font-black font-headline text-primary tracking-tight uppercase leading-none group-hover:text-white transition-colors">{i.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-[1px] border text-[9px] font-bold font-label uppercase ${rarityColor}`}>{actualRarity}</span>
                    <span className="px-2 py-[1px] border border-secondary/30 text-[9px] font-bold font-label uppercase text-secondary">{i.type}</span>
                    {filteredTargetTraits.slice(0, 5).map(trait => (
                        <span key={trait} className="px-2 py-[1px] bg-primary/10 border border-primary/20 text-[9px] font-bold font-label text-primary uppercase">{trait}</span>
                    ))}
                    {filteredTargetTraits.length > 5 && (
                        <span className="px-2 py-[1px] bg-primary/10 border border-primary/20 text-[9px] font-bold font-label text-primary uppercase">+{filteredTargetTraits.length - 5}</span>
                    )}
                </div>
            </div>

            <div className="text-center pr-6 border-r border-outline-variant/20 hidden sm:flex items-center gap-6">
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest leading-none mb-1">Price</span>
                    <span className="text-xl font-black font-headline text-primary leading-none">{i.price || 0}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-outline-variant/20 pl-6">
                    <span className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest leading-none mb-1">Level</span>
                    <span className="text-xl font-black font-headline text-primary leading-none" title="Level">{i.level}</span>
                </div>
            </div>

            <div className="pl-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors text-[24px]" data-icon="chevron_right">chevron_right</span>
            </div>
          </Link>
        )})}
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-xs text-outline-variant italic border border-outline-variant/10 bg-surface-container-low">
            No items found matching your criteria.
          </div>
        )}
      </div>
    </main>
  );
}
