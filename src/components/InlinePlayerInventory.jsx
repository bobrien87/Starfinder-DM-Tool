import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import InlineEditable from './InlineEditable';

export default function InlinePlayerInventory({ inventory = [], collectionName, entityId, isEditing }) {
  const { updateEntity, getEntity, items } = useDatabase();
  const [isAdding, setIsAdding] = useState(false);

  const safeInv = Array.isArray(inventory) ? inventory : Object.values(inventory || {});

  // Available items = global items NOT already in inventory
  const existingIds = safeInv.map(i => i.itemId);
  const availableItems = (items || []).filter(item => !existingIds.includes(item.id)).sort((a,b) => a.name.localeCompare(b.name));

  const defaultInvEntry = (itemId) => ({ itemId, quantity: 1, equipped: false });

  const handleAdd = async (itemId) => {
    setIsAdding(true);
    const newArray = [...safeInv, defaultInvEntry(itemId)];
    try {
      await updateEntity(collectionName, entityId, { inventory: newArray });
    } catch (err) {
      console.error("Failed to add inventory item", err);
    }
    setIsAdding(false);
  };

  const handleRemove = async (indexToRemove) => {
    const newArray = safeInv.filter((_, i) => i !== indexToRemove);
    try {
      await updateEntity(collectionName, entityId, { inventory: newArray });
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const updateInvField = async (index, field, value) => {
    const newArray = [...safeInv];
    newArray[index] = { ...newArray[index], [field]: value };
    try {
      await updateEntity(collectionName, entityId, { inventory: newArray });
    } catch (err) {
       console.error("Failed to map inventory field", err);
    }
  };

  if (!isEditing && safeInv.length === 0) {
    return <span className="text-[12px] text-outline-variant">No items documented.</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {safeInv.map((invEntry, idx) => {
        const def = getEntity('items', invEntry.itemId);
        const displayName = def ? def.name : invEntry.itemId;
        
        return (
          <span key={`${invEntry.itemId}-${idx}`} className="px-2 py-0.5 border border-outline-variant/10 text-[12px] text-primary flex items-center gap-1 group">
            {displayName} 
            
            {isEditing ? (
              <span className="flex items-center text-primary/70 ml-1 border-l border-outline-variant/20 pl-1 shrink-0">
                x<InlineEditable type="number" value={invEntry.quantity} collectionName={collectionName} entityId={entityId} isEditing={isEditing} className="w-6 text-center text-[12px] bg-black/50" onSave={(val) => updateInvField(idx, 'quantity', val)} />
              </span>
            ) : (
              invEntry.quantity > 1 && <span className="opacity-60 shrink-0">(x{invEntry.quantity})</span>
            )}

            {isEditing && (
              <button onClick={() => handleRemove(idx)} className="hover:text-red-400 ml-1 leading-none text-red-500/50">
                ×
              </button>
            )}
          </span>
        );
      })}
      
      {isEditing && availableItems.length > 0 && (
        isAdding ? (
          <select 
            autoFocus
            onChange={(e) => {
              if (e.target.value) handleAdd(e.target.value);
              else setIsAdding(false);
            }}
            onBlur={() => setIsAdding(false)}
            className="px-2 py-[2px] border border-outline-variant/10 text-[12px] outline-none border-dashed border-primary cursor-pointer text-primary"
            defaultValue=""
          >
            <option value="">Select Item...</option>
            {availableItems.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        ) : (
          <button onClick={() => setIsAdding(true)} className="px-2 py-[2px] border border-outline-variant/10 text-[12px] text-primary border-dashed border-primary hover:bg-primary/20 cursor-pointer opacity-70">
            + Add Item
          </button>
        )
      )}
    </div>
  );
}
