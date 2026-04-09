import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import ItemEdit from '../components/ItemEdit';
import StatPill from '../components/StatPill';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, updateEntity, deleteEntity } = useDatabase();

  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (location.state?.edit) {
      setIsEditing(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (items.length > 0) {
      const found = items.find(i => i.id === id);
      if (found) setItem(found);
    }
  }, [items, id]);

  if (!item) {
      return (
          <main className="ml-0 mt-0 p-6 h-full flex justify-center items-center bg-transparent">
            <div className="text-primary font-label tracking-widest uppercase animate-pulse">Scanning Compendium...</div>
          </main>
      );
  }

  const handleDelete = async () => {
    if (window.confirm("Permanently delete this item component?")) {
      await deleteEntity('items', id);
      navigate('/items');
    }
  };

  const handleSave = async (updatedData) => {
    await updateEntity('items', id, updatedData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ItemEdit 
        item={item} 
        onSave={handleSave} 
        onCancel={() => setIsEditing(false)} 
        onDelete={handleDelete}
      />
    );
  }

  return (
    <main className="ml-0 mt-0 p-6 h-full overflow-y-auto bg-transparent flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase w-auto min-w-[200px]">
                {item.name}
             </h1>
          </div>
          <div className="flex gap-2 mt-3 items-center flex-wrap">
             <StatPill variant="secondary">
                {isEditing ? (
                   <>Level <input type="number" value={item.level} onChange={e => {
                      const val = parseInt(e.target.value);
                      updateEntity('items', item.id, { level: isNaN(val) ? 0 : val });
                   }} className="bg-transparent border-b border-primary outline-none focus:border-white text-secondary w-8 ml-1" /></>
                ) : `Level ${item.level}`}
             </StatPill>
             
             <StatPill>
                {isEditing ? (
                   <input type="text" value={item.type || ''} onChange={e => updateEntity('items', item.id, { type: e.target.value })} className="bg-transparent border-b border-primary outline-none focus:border-white w-20 text-primary" placeholder="Type..." />
                ) : (item.type || 'Unknown')}
             </StatPill>

             {item.traits?.map((t, idx) => (
                 <StatPill key={idx}>{t}</StatPill>
             ))}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/items" className="w-8 h-8 rounded border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors" title="Back">
             <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </Link>
          <button 
             onClick={() => setIsEditing(true)} 
             className="px-5 py-2 font-bold font-label text-xs uppercase tracking-widest transition-colors border border-primary/50 text-primary hover:bg-primary/10"
          >
            Edit Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Stats & Description */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="flex gap-8 border-b border-outline-variant/30 pb-4">
             <div>
                <div className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest">Price</div>
                <div className="text-xl font-body text-primary font-bold mt-1">{item.price || 0}c</div>
             </div>
             <div>
                <div className="text-[10px] font-bold font-label text-secondary uppercase tracking-widest">Bulk</div>
                <div className="text-xl font-body text-primary font-bold mt-1">{item.bulk || 'L'}</div>
             </div>
          </div>

          <div>
             <div className="text-xs font-bold font-label text-primary uppercase tracking-widest mb-2">Traits</div>
             <div className="flex flex-wrap gap-2">
               {(item.traits || []).length === 0 && <span className="text-secondary/50 text-sm">None</span>}
               {(item.traits || []).map((t, idx) => (
                 <span key={idx} className="bg-surface-container border border-outline-variant/30 text-secondary px-2 py-1 text-xs uppercase font-label tracking-widest">
                   {t}
                 </span>
               ))}
             </div>
          </div>

          <div className="bg-surface-container-low p-4 border-l border-primary/30 text-sm text-secondary font-body whitespace-pre-wrap leading-relaxed">
            {item.description || "No description provided."}
          </div>

        </div>

        {/* RIGHT COLUMN: Type-Specific Sub-Panels */}
        <div className="flex flex-col gap-4">
            
            {/* WEAPON DATA */}
            {item.type === 'Weapon' && item.weaponData && (
                <div className="bg-surface-container-low border border-primary/20 p-4">
                    <h3 className="text-primary font-headline uppercase font-black tracking-widest text-sm border-b border-primary/20 pb-2 mb-3">Weapon Profile</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Damage</span>
                            <span className="text-sm font-bold text-on-surface">{item.weaponData.damage}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Range</span>
                            <span className="text-sm font-bold text-on-surface">{item.weaponData.range}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Category</span>
                            <span className="text-sm text-on-surface">{item.weaponData.category}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Group</span>
                            <span className="text-sm text-on-surface">{item.weaponData.group}</span>
                        </div>
                        {item.weaponData.capacity > 0 && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-xs font-label text-secondary tracking-widest uppercase">Capacity</span>
                                    <span className="text-sm text-on-surface">{item.weaponData.capacity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs font-label text-secondary tracking-widest uppercase">Usage</span>
                                    <span className="text-sm text-on-surface">{item.weaponData.usage}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ARMOR DATA */}
            {item.type === 'Armor' && item.armorData && (
                <div className="bg-surface-container-low border border-primary/20 p-4">
                    <h3 className="text-primary font-headline uppercase font-black tracking-widest text-sm border-b border-primary/20 pb-2 mb-3">Armor Profile</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">AC Bonus</span>
                            <span className="text-sm font-bold text-on-surface">+{item.armorData.acBonus}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Dex Cap</span>
                            <span className="text-sm font-bold text-on-surface">+{item.armorData.dexCap}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Str Rqmt</span>
                            <span className="text-sm text-on-surface">{item.armorData.strengthReq || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs font-label text-secondary tracking-widest uppercase">Speed Penalty</span>
                            <span className="text-sm text-on-surface">{item.armorData.speedPenalty === 0 ? '-' : `-${item.armorData.speedPenalty} ft`}</span>
                        </div>
                    </div>
                </div>
            )}

        </div>

      </div>

    </main>
  );
}
