import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import CustomMultiSelect from './CustomMultiSelect';
import StatPill from './StatPill';
import { SIZE_TRAITS } from '../utils/constants';

export default function InlineStringArray({ 
  values = [], 
  collectionName, 
  entityId, 
  fieldPath, 
  isEditing,
  options = null, // If provided, renders a dropdown instead of typed text
  onSaveValue = null // If provided, overrides default Firebase updateEntity behavior
}) {
  const { updateEntity } = useDatabase();
  const safeValues = values || [];

  if (!isEditing && safeValues.length === 0) {
    return <span className="text-xs text-outline-variant italic opacity-50">None</span>;
  }

  if (isEditing) {
    return (
      <div className="w-full flex-1">
        <CustomMultiSelect 
          value={safeValues} 
          onChange={async (newArray) => {
            try {
              if (onSaveValue) { await onSaveValue(newArray); }
              else { await updateEntity(collectionName, entityId, { [fieldPath]: newArray }); }
            } catch (err) {
              console.error("Failed to update array string:", err);
            }
          }} 
          options={options || []}
          placeholder="Add..."
        />
      </div>
    );
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {safeValues.map((v, i) => {
        const isSize = SIZE_TRAITS.includes((v || '').toLowerCase());
        return <StatPill key={i} variant={isSize ? "secondary" : "primary"}>{v}</StatPill>;
      })}
    </div>
  );
}
