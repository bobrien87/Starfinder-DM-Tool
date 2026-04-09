import React from 'react';
import SingleD20Icon from './SingleD20Icon';

export default function StatPill({ 
    children, 
    className = "",
    variant = "primary",  // "primary", "negative", "positive", "edit"
    onClick = null,
    title = null,
    label = null
}) {
    const isEdit = variant === "edit";
    
    // Explicit sizing mirroring StrikeActionGroup logic exactly
    const sizeClasses = "h-6 px-2 text-[9px] uppercase justify-center whitespace-nowrap overflow-hidden";
    
    // Base layout & font
    const baseClasses = `inline-flex flex-nowrap items-center gap-1 font-bold font-label rounded 
                        ${onClick && !isEdit ? "group shadow-sm" : ""}`;

    // Colors & Borders
    let colorClasses = "";
    if (onClick && !isEdit) {
        if (variant === "negative") {
            colorClasses = "bg-[#40282A] border border-error/50 text-error hover:bg-error hover:text-black transition-colors";
        } else {
            colorClasses = "bg-[#0E141C] border border-primary/50 text-primary hover:text-black hover:bg-primary transition-colors";
        }
    } else {
        // Non-interactive pills (or edit pills)
        if (variant === "primary") colorClasses = "bg-[#222B33] border border-[#222B33]/50 text-secondary";
        else if (variant === "negative") colorClasses = "bg-[#40282A] border border-[#40282A]/50 text-error";
        else if (variant === "positive") colorClasses = "bg-[#1E3A29] border border-[#1E3A29]/50 text-[#4ade80]";
        else if (variant === "edit") colorClasses = "bg-surface-container-high border border-primary/30 text-primary shadow-sm group hover:animate-pulse cursor-pointer";
        else colorClasses = "bg-[#222B33] border border-[#222B33]/50 text-secondary";
    }

    const interactiveClasses = onClick && !isEdit ? "cursor-pointer" : "";
    const combinedClasses = `${baseClasses} ${sizeClasses} ${colorClasses} ${interactiveClasses} ${className}`.trim();

    const Component = onClick ? "button" : "span";

    return (
        <Component className={combinedClasses} onClick={onClick} title={title}>
            {onClick && !isEdit && <SingleD20Icon className="w-3.5 h-3.5 group-hover:animate-spin opacity-80 group-hover:opacity-100 shrink-0" />}
            {label && <span className="opacity-70 group-hover:opacity-100">{label}</span>}
            {children}
        </Component>
    );
}
