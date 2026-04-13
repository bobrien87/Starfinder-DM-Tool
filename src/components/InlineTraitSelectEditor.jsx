import React from 'react';
import CustomMultiSelect from './CustomMultiSelect';
import { useDatabase } from '../context/DatabaseContext';
import StatPill from './StatPill';

export default function InlineTraitSelectEditor({ 
  values = [], 
  collectionName, 
  entityId, 
  fieldPath, 
  isEditing, 
  options = [],
  placeholder = "Add trait..."
}) {
  const { updateEntity } = useDatabase();

  const handleChange = (newValues) => {
    updateEntity(collectionName, entityId, { [fieldPath]: newValues });
  };

  if (!isEditing) {
    if (!values || values.length === 0) {
      return <span className="text-xs text-outline-variant italic group-hover:text-primary transition-colors">None</span>;
    }
    return (
      <div className="flex gap-1 flex-wrap">
        {values.map((v, i) => (
          <StatPill key={i} size="xs">{v}</StatPill>
        ))}
      </div>
    );
  }

  return (
    <CustomMultiSelect 
      value={values || []} 
      onChange={handleChange} 
      options={options} 
      placeholder={placeholder}
    />
  );
}
