import React from 'react';
import SingleD20Icon from './SingleD20Icon';
import InlineEditable from './InlineEditable';

export default function StatCard({ 
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
    const baseClasses = "p-3 flex flex-col justify-center items-center h-full border rounded shadow-sm transition-colors group w-full";
    
    // Interactive vs non-interactive styles
    const interactiveClasses = isInteractive 
        ? "bg-surface-container-lowest border-outline-variant/20 hover:bg-primary/20 hover:border-primary/50 cursor-pointer"
        : "bg-surface-container-lowest border-outline-variant/20";

    return (
        <Component 
            className={`${baseClasses} ${interactiveClasses}`}
            onClick={isInteractive ? () => rollDice(rollName, value || 0) : undefined}
            type={isInteractive ? "button" : undefined}
        >
            <span className={`text-[10px] font-label uppercase opacity-60 mb-1 leading-none tracking-widest transition-colors ${isInteractive ? 'text-secondary group-hover:text-primary' : 'text-secondary'}`}>
                {label}
            </span>
            {isEditing ? (
                <div className="text-[1.4rem] font-black font-headline text-primary leading-none w-full flex items-center justify-center">
                    <InlineEditable type="number" value={value || 0} collectionName={collectionName} entityId={entityId} fieldPath={fieldPath} isEditing={isEditing} className="w-16 text-center" />
                </div>
            ) : (
                <div className={`flex items-center justify-center gap-1.5 text-[1.4rem] font-black font-headline leading-none transition-colors text-center whitespace-nowrap ${isInteractive ? 'text-primary group-hover:text-white' : 'text-primary'}`}>
                    <SingleD20Icon className="w-4 h-4 group-hover:animate-spin opacity-80 shrink-0" />
                    {formatMod(value || 0)}
                </div>
            )}
        </Component>
    );
}
