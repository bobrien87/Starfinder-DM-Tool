import React from 'react';
import SingleD20Icon from './SingleD20Icon';
import Tooltip from './Tooltip';
import { TRAIT_DESCRIPTIONS } from '../utils/constants';

export default function StatPill({ 
  children, 
  className = "",
  variant = "primary", // "primary", "negative", "positive", "edit"
  onClick = null,
  title = null,
  label = null
}) {
  const isEdit = variant === "edit";
  
  const sizeClasses = "h-6 px-2 text-[12px] font-[500] leading-none pt-px justify-center whitespace-nowrap overflow-hidden";
  
  // Base layout & font
  const baseClasses = `inline-flex flex-nowrap items-center gap-1 font-label rounded 
            ${onClick && !isEdit ? "group shadow-sm" : ""}`;

  const isError = variant === 'negative';

  // Colors & Borders
  let colorClasses = "";
  if (onClick && !isEdit) {
    colorClasses = "bg-[#12111A] border border-tertiary text-primary hover:border-secondary hover:text-primary hover:bg-[color-mix(in_srgb,#12111A,#ef574e_20%)] transition-colors";
  } else {
    // Non-interactive pills (or edit pills)
    if (variant === "primary") colorClasses = "bg-[#12111A] border border-tertiary text-primary";
    else if (variant === "positive") colorClasses = "bg-[#12111A] border border-primary/50 text-primary";
    else if (variant === "condition-positive") colorClasses = "bg-[#12111A] border border-tertiary text-primary";
    else if (variant === "condition-negative") colorClasses = "bg-[#12111A] border border-tertiary text-primary";
    else if (variant === "secondary") colorClasses = "bg-[#12111A] border border-primary text-primary";
    else if (variant === "accent-green") colorClasses = "bg-[#12111A] border border-[#1df283] text-[#1df283]";
    else if (variant === "edit") colorClasses = "border border-primary/30 text-primary shadow-sm group hover:animate-pulse cursor-pointer";
    else colorClasses = "bg-[#12111A] border border-tertiary text-primary";
  }

  const interactiveClasses = onClick && !isEdit ? "cursor-pointer" : "";
  const combinedClasses = `${baseClasses} ${sizeClasses} ${colorClasses} ${interactiveClasses} ${className}`.trim();

  const Component = onClick ? "button" : "span";

  let description = null;
  const contentToAnalyze = label || (typeof children === 'string' ? children : (Array.isArray(children) && typeof children[0] === 'string' ? children[0] : null));
  if (contentToAnalyze) {
     const baseType = contentToAnalyze.split(' ')[0];
     description = TRAIT_DESCRIPTIONS[baseType] || TRAIT_DESCRIPTIONS[contentToAnalyze];
  }

  const pillNode = (
    <Component className={combinedClasses} onClick={onClick} title={description ? undefined : title}>
      {variant === 'condition-positive' && <span className="material-symbols-outlined text-[14px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)]">keyboard_double_arrow_up</span>}
      {variant === 'condition-negative' && <span className="material-symbols-outlined text-[14px] text-[#fad23f] animate-pulse [text-shadow:0_0_6px_rgba(250,210,63,0.8)]">keyboard_double_arrow_down</span>}
      {onClick && !isEdit && <SingleD20Icon className={`w-4 h-4 relative bottom-[0.5px] group-hover:animate-spin [animation-duration:3s] opacity-80 group-hover:opacity-100 shrink-0 text-primary transition-colors`} />}
      {label && <span className="opacity-70 group-hover:opacity-100">{label}</span>}
      <span className="pt-[1px]">{children}</span>
    </Component>
  );

  return description && !isEdit ? (
    <Tooltip content={description}>
      {pillNode}
    </Tooltip>
  ) : pillNode;
}
