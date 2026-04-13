import React, { useState } from 'react';
import CustomMultiSelect from './CustomMultiSelect';

export default function ItemEdit({ item, onSave, onCancel, onDelete }) {
 const [formData, setFormData] = useState({
  name: item.name || '',
  level: item.level || 1,
  type: item.type || 'Gear',
  bulk: item.bulk || 'L',
  price: item.price || 0,
  description: item.description || '',
  traits: item.traits || [],
  weaponData: item.weaponData || {
   damage: "1d6 P", category: "Simple", group: "Projectile", range: "30 ft.", capacity: 10, usage: 1, reload: "1 Use"
  },
  armorData: item.armorData || {
   acBonus: 1, dexCap: 5, strengthReq: 0, speedPenalty: 0
  }
 });

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   [name]: name === 'level' || name === 'price' ? Number(value) : value
  }));
 };

 const handleWeaponChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   weaponData: { ...prev.weaponData, [name]: name === 'capacity' || name === 'usage' ? Number(value) : value }
  }));
 };

 const handleArmorChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
   ...prev,
   armorData: { ...prev.armorData, [name]: Number(value) }
  }));
 };

 const handleSaveWrapper = () => {
  // Prep final payload
  const payload = { ...formData };
  
  // Purge irrelevant data payloads depending on type
  if (payload.type !== 'Weapon') delete payload.weaponData;
  if (payload.type !== 'Armor') delete payload.armorData;

  onSave(payload);
 };

 return (
  <main className="ml-0 mt-0 p-6 h-full overflow-y-auto flex flex-col gap-6">
   
   <div className="flex justify-between items-center border-b pb-4 border-tertiary/30">
    <h1>Edit Item</h1>
    <div className="flex gap-4 items-center">
     <button onClick={onDelete} className="w-8 h-8 rounded border border-accent-yellow/40 text-accent-yellow flex items-center justify-center hover:bg-accent-yellow/10 transition-colors" title="Delete Item">
       <span className="material-symbols-outlined text-[18px]">delete</span>
     </button>
   <button onClick={onCancel} className="px-5 py-2 font-label text-xs tracking-widest transition-colors border border-primary/50 text-primary hover:bg-primary/10">
      Cancel
     </button>
   <button onClick={handleSaveWrapper} className="px-5 py-2 font-label text-xs tracking-widest transition-colors bg-primary text-on-primary glow-primary">
      Save Item
     </button>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
    
    {/* LEFT: CORE DETAILS */}
    <div className="flex flex-col gap-6">
     <h3>Core Specifications</h3>
     
     <label className="flex flex-col gap-1">
   <span className="micro-label">Item Name</span>
      <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" />
     </label>
     
     <div className="grid grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
    <span className="micro-label">Level</span>
       <input type="number" name="level" value={formData.level} onChange={handleChange} className="input-field" />
      </label>
      <label className="flex flex-col gap-1">
    <span className="micro-label">Type</span>
       <select name="type" value={formData.type} onChange={handleChange} className="input-field py-3">
        <option value="Weapon">Weapon</option>
        <option value="Armor">Armor</option>
        <option value="Consumable">Consumable</option>
        <option value="Gear">Gear</option>
       </select>
      </label>
     </div>

     <div className="grid grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
    <span className="micro-label">Price (Credits)</span>
       <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-field" />
      </label>
      <label className="flex flex-col gap-1">
    <span className="micro-label">Bulk</span>
       <input type="text" name="bulk" value={formData.bulk} onChange={handleChange} className="input-field" />
      </label>
     </div>

     <label className="flex flex-col gap-1 z-30">
   <span className="micro-label">Traits</span>
      <CustomMultiSelect 
        value={formData.traits} 
        onChange={(newTraits) => setFormData(prev => ({ ...prev, traits: newTraits }))} 
        options={["Analog", "Archais", "Block", "Operative", "Unwieldy", "Powered", "Tech", "Magic"]}
        placeholder="e.g. Analog, Tech, Unwieldy"
      />
     </label>

     <label className="flex flex-col gap-1">
   <span className="micro-label">Description</span>
      <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-32 py-2"></textarea>
     </label>
    </div>

    {/* RIGHT: DYNAMIC PANELS DEPENDENT ON TYPE */}
    <div className="flex flex-col gap-6">
      <h3>Technical Profile</h3>
      
      {formData.type === 'Weapon' && (
        <div className="flex flex-col gap-4 border border-primary/20 p-4">
          <label className="flex flex-col gap-1">
      <span className="micro-label">Damage Model</span>
            <input type="text" name="damage" value={formData.weaponData.damage} onChange={handleWeaponChange} className="input-field py-2" placeholder="1d8 F" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
       <span className="micro-label">Category</span>
              <input type="text" name="category" value={formData.weaponData.category} onChange={handleWeaponChange} className="input-field py-2" />
            </label>
            <label className="flex flex-col gap-1">
       <span className="micro-label">Group</span>
              <input type="text" name="group" value={formData.weaponData.group} onChange={handleWeaponChange} className="input-field py-2" />
            </label>
          </div>
          <label className="flex flex-col gap-1">
      <span className="micro-label">Range</span>
            <input type="text" name="range" value={formData.weaponData.range} onChange={handleWeaponChange} className="input-field py-2" placeholder="Melee / 80 ft." />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
       <span className="micro-label">Capacity</span>
              <input type="number" name="capacity" value={formData.weaponData.capacity} onChange={handleWeaponChange} className="input-field py-2 text-center" />
            </label>
            <label className="flex flex-col gap-1">
       <span className="micro-label">Usage</span>
              <input type="number" name="usage" value={formData.weaponData.usage} onChange={handleWeaponChange} className="input-field py-2 text-center" />
            </label>
            <label className="flex flex-col gap-1">
       <span className="micro-label">Reload</span>
              <input type="text" name="reload" value={formData.weaponData.reload} onChange={handleWeaponChange} className="input-field py-2 text-center" />
            </label>
          </div>
        </div>
      )}

      {formData.type === 'Armor' && (
        <div className="flex flex-col gap-4 border border-primary/20 p-4">
          <div className="grid grid-cols-2 gap-4">
             <label className="flex flex-col gap-1">
       <span className="micro-label">AC Bonus</span>
              <input type="number" name="acBonus" value={formData.armorData.acBonus} onChange={handleArmorChange} className="input-field py-2 text-center" />
            </label>
            <label className="flex flex-col gap-1">
       <span className="micro-label">Dex Cap</span>
              <input type="number" name="dexCap" value={formData.armorData.dexCap} onChange={handleArmorChange} className="input-field py-2 text-center" />
            </label>
            <label className="flex flex-col gap-1">
       <span className="micro-label">Strength Rqmt</span>
              <input type="number" name="strengthReq" value={formData.armorData.strengthReq} onChange={handleArmorChange} className="input-field py-2 text-center" />
            </label>
            <label className="flex flex-col gap-1">
       <span className="micro-label">Speed Penalty</span>
              <input type="number" name="speedPenalty" value={formData.armorData.speedPenalty} onChange={handleArmorChange} className="input-field py-2 text-center" placeholder="e.g. 5" />
            </label>
          </div>
        </div>
      )}
      
      {formData.type === 'Gear' && (
    <div className="text-primary font-label tracking-widest text-xs border border-dashed border-outline-variant/30 p-8 text-center opacity-70">
          Standard non-combat mechanical equipment. No supplemental data mapping required.
        </div>
      )}

      {formData.type === 'Consumable' && (
    <div className="text-primary font-label tracking-widest text-xs border border-dashed border-outline-variant/30 p-8 text-center opacity-70">
          Consumable items define their mechanical effects entirely through the Description block. No supplemental data mapping required.
        </div>
      )}

    </div>

   </div>
  </main>
 );
}
