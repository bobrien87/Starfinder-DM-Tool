import React from 'react';
import SingleD20Icon from './SingleD20Icon';
import InlineEditable from './InlineEditable';

export default function StatList({ 
  label,
  value,
  rollName,
  collectionName,
  entityId,
  fieldPath,
  isEditing = false,
  rollDice
}) {
  const formatMod = (num) => num >= 0 ? `+${num}` : num;

  const isInteractive = !isEditing && rollDice;
  const Component = isInteractive ? 'button' : 'div';
  
  // Base styles
  const baseClasses = "px-4 py-3 flex justify-between items-center border rounded shadow-sm transition-colors group w-full";
  
  // Interactive vs non-interactive styles
  const interactiveClasses = isInteractive 
    ? "border-outline-variant/20 hover:bg-primary/20 hover:border-primary/50 cursor-pointer"
    : "border-outline-variant/20";

  return (
    <Component 
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={isInteractive ? () => rollDice(rollName, value || 0) : undefined}
      type={isInteractive ? "button" : undefined}
    >
   <span className={`text-xs font-label tracking-widest transition-colors ${isInteractive ? 'text-primary group-hover:text-primary' : 'text-primary'}`}>
        {label}
      </span>
      {isEditing ? (
        <div className="text-xs font-headline text-primary leading-none w-16 flex justify-end items-center">
          <InlineEditable type="number" value={value || 0} collectionName={collectionName} entityId={entityId} fieldPath={fieldPath} isEditing={isEditing} className="w-full text-right" />
        </div>
      ) : (
        <div className={`flex items-center gap-1.5 text-xs font-headline leading-none transition-colors ${isInteractive ? 'text-primary group-hover:text-white' : 'text-primary'}`}>
          <SingleD20Icon className="w-3.5 h-3.5 group-hover:animate-spin opacity-80 shrink-0" />
          {formatMod(value || 0)}
        </div>
      )}
    </Component>
  );
}
