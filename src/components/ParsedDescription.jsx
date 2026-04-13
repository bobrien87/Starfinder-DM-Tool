import React from 'react';
import SingleD20Icon from './SingleD20Icon';

const formatRollArgs = (type, args, label) => {
  if (label) return label;
  
  if (type === 'Damage') {
    // Clean up internal brackets for display: 4d6[bludgeoning] -> 4d6 bludgeoning
    return `Damage ${args.replace(/\[/g, ' ').replace(/\]/g, '')}`;
  }
  
  if (type === 'Check' || type === 'Save') {
    const parts = args.split('|');
    let saveType = '';
    let dc = '';
    let basic = false;
    
    parts.forEach(p => {
      p = p.trim();
      if (p.toLowerCase() === 'basic') basic = true;
      else if (p.toLowerCase().startsWith('dc:')) dc = p.split(':')[1];
      else saveType = p.charAt(0).toUpperCase() + p.slice(1);
    });
    
    let out = [];
    if (dc) out.push(`DC ${dc}`);
    if (basic) out.push('Basic');
    if (saveType) out.push(saveType);
    
    return out.join(' ') || type;
  }
  
  if (type === 'Template') {
    // type:cone|distance:15 -> 15-foot cone
    const parts = args.split('|');
    let shape = '';
    let dist = '';
    parts.forEach(p => {
      p = p.trim();
      if (p.startsWith('type:')) shape = p.split(':')[1];
      if (p.startsWith('distance:')) dist = p.split(':')[1];
    });
    return `${dist ? dist + '-foot ' : ''}${shape}`;
  }
  
  return `${type} ${args}`;
};

const PART_REGEX = /(@[a-zA-Z]+\[[^\]]*(?:\[[^\]]*\][^\]]*)*\](?:{[^}]*})?|\*\*.*?\*\*|\[\[\/[^\]]+\]\](?:{[^}]*})?)/g;
const ROLL_REGEX = /@([a-zA-Z]+)\[([^\]]*(?:\[[^\]]*\][^\]]*)*)\](?:{([^}]*)})?/;
const COMMAND_REGEX = /\[\[\/[^\]]+\]\](?:{([^}]*)})?/;

export default function ParsedDescription({ text, className = "" }) {
  if (!text) return null;

  // Split the text into parts: Markdown bolds, Foundry strings, Commands, and regular strings
  const parts = text.split(PART_REGEX);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Handle Bold Markdown
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // Handle Foundry Bracket Commands (e.g. [[/act force-open]]{Athletics})
        const commandMatch = part.match(COMMAND_REGEX);
        if (commandMatch) {
          const label = commandMatch[1];
          return (
            <span key={index} className="text-secondary">
              {label || part.replace(/[\[\]{}]/g, '').replace(/^\/[a-zA-Z\-]+ /, '')}
            </span>
          );
        }

        // Handle Foundry @ Rolls & Conditions
        const rollMatch = part.match(ROLL_REGEX);
        if (rollMatch) {
          const type = rollMatch[1];
          const args = rollMatch[2];
          const label = rollMatch[3];

          // Sub-route conditions/UUIDs away from interactive dice-roll logic
          if (['UUID', 'Condition', 'Compendium', 'Item'].includes(type)) {
            return (
              <span key={index} className="text-secondary">
                {label || args.split('.').pop()}
              </span>
            );
          }
          
          return (
            <span key={index} className="text-secondary cursor-help group/roll transition-colors hover:text-primary mx-[0.25ch]">
              <SingleD20Icon className="inline w-[1.15em] h-[1.15em] opacity-80 group-hover/roll:animate-spin [animation-duration:3s] group-hover/roll:opacity-100 text-current relative top-[-0.1em] mr-[0.5ch]" />
              <span className="whitespace-nowrap">
                {formatRollArgs(type, args, label)}
              </span>
            </span>
          );
        }

        // Return regular text cleanly
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
