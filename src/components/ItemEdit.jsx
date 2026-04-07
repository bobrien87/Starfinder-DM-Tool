import React, { useState } from 'react';

export default function ItemEdit({ item, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({
    name: item.name || '',
    level: item.level || 1,
    type: item.type || 'Gear',
    bulk: item.bulk || 'L',
    price: item.price || 0,
    description: item.description || '',
    traits: (item.traits || []).join(', '),
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
    const payload = { ...formData, traits: formData.traits.split(',').map(t => t.trim()).filter(Boolean) };
    
    // Purge irrelevant data payloads depending on type
    if (payload.type !== 'Weapon') delete payload.weaponData;
    if (payload.type !== 'Armor') delete payload.armorData;

    onSave(payload);
  };

  return (
    <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-surface flex flex-col gap-6">
      
      <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
        <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase">Edit Item</h1>
        <div className="flex gap-4 items-center">
          <button onClick={onDelete} className="w-8 h-8 rounded border border-error/40 text-error flex items-center justify-center hover:bg-error/10 transition-colors" title="Delete Item">
              <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          <button onClick={onCancel} className="px-5 py-2 font-bold font-label text-xs uppercase tracking-widest transition-colors border border-primary/50 text-primary hover:bg-primary/10">
            Cancel
          </button>
          <button onClick={handleSaveWrapper} className="px-5 py-2 font-bold font-label text-xs uppercase tracking-widest transition-colors bg-primary text-on-primary glow-primary">
            Save Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        
        {/* LEFT: CORE DETAILS */}
        <div className="flex flex-col gap-6">
          <h2 className="text-primary font-black font-headline tracking-widest uppercase border-b border-primary/20 pb-2">Core Specifications</h2>
          
          <label className="flex flex-col gap-1">
            <span className="text-xs font-label uppercase tracking-widest text-secondary">Item Name</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" />
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-label uppercase tracking-widest text-secondary">Level</span>
              <input type="number" name="level" value={formData.level} onChange={handleChange} className="input-field" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-label uppercase tracking-widest text-secondary">Type</span>
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
              <span className="text-xs font-label uppercase tracking-widest text-secondary">Price (Credits)</span>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-field" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-label uppercase tracking-widest text-secondary">Bulk</span>
              <input type="text" name="bulk" value={formData.bulk} onChange={handleChange} className="input-field" />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-label uppercase tracking-widest text-secondary">Traits (Comma Separated)</span>
            <input type="text" name="traits" value={formData.traits} onChange={handleChange} className="input-field" placeholder="e.g. Analog, Tech, Unwieldy" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-label uppercase tracking-widest text-secondary">Description</span>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-32 py-2"></textarea>
          </label>
        </div>

        {/* RIGHT: DYNAMIC PANELS DEPENDENT ON TYPE */}
        <div className="flex flex-col gap-6">
            <h2 className="text-primary font-black font-headline tracking-widest uppercase border-b border-primary/20 pb-2">Technical Profile</h2>
            
            {formData.type === 'Weapon' && (
                <div className="flex flex-col gap-4 bg-surface-container-low border border-primary/20 p-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Damage Model</span>
                        <input type="text" name="damage" value={formData.weaponData.damage} onChange={handleWeaponChange} className="input-field py-2" placeholder="1d8 F" />
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Category</span>
                            <input type="text" name="category" value={formData.weaponData.category} onChange={handleWeaponChange} className="input-field py-2" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Group</span>
                            <input type="text" name="group" value={formData.weaponData.group} onChange={handleWeaponChange} className="input-field py-2" />
                        </label>
                    </div>
                    <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Range</span>
                        <input type="text" name="range" value={formData.weaponData.range} onChange={handleWeaponChange} className="input-field py-2" placeholder="Melee / 80 ft." />
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Capacity</span>
                            <input type="number" name="capacity" value={formData.weaponData.capacity} onChange={handleWeaponChange} className="input-field py-2 text-center" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Usage</span>
                            <input type="number" name="usage" value={formData.weaponData.usage} onChange={handleWeaponChange} className="input-field py-2 text-center" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Reload</span>
                            <input type="text" name="reload" value={formData.weaponData.reload} onChange={handleWeaponChange} className="input-field py-2 text-center" />
                        </label>
                    </div>
                </div>
            )}

            {formData.type === 'Armor' && (
                <div className="flex flex-col gap-4 bg-surface-container-low border border-primary/20 p-4">
                    <div className="grid grid-cols-2 gap-4">
                         <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">AC Bonus</span>
                            <input type="number" name="acBonus" value={formData.armorData.acBonus} onChange={handleArmorChange} className="input-field py-2 text-center" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Dex Cap</span>
                            <input type="number" name="dexCap" value={formData.armorData.dexCap} onChange={handleArmorChange} className="input-field py-2 text-center" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Strength Rqmt</span>
                            <input type="number" name="strengthReq" value={formData.armorData.strengthReq} onChange={handleArmorChange} className="input-field py-2 text-center" />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Speed Penalty</span>
                            <input type="number" name="speedPenalty" value={formData.armorData.speedPenalty} onChange={handleArmorChange} className="input-field py-2 text-center" placeholder="e.g. 5" />
                        </label>
                    </div>
                </div>
            )}
            
            {formData.type === 'Gear' && (
                <div className="text-secondary font-label uppercase tracking-widest text-xs border border-dashed border-outline-variant/30 p-8 text-center bg-surface-container-low opacity-70">
                    Standard non-combat mechanical equipment. No supplemental data mapping required.
                </div>
            )}

            {formData.type === 'Consumable' && (
                <div className="text-secondary font-label uppercase tracking-widest text-xs border border-dashed border-outline-variant/30 p-8 text-center bg-surface-container-low opacity-70">
                    Consumable items define their mechanical effects entirely through the Description block. No supplemental data mapping required.
                </div>
            )}

        </div>

      </div>
    </main>
  );
}
