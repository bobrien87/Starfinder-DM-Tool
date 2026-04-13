import React from 'react';

export default function Button({ 
 children, 
 variant = 'primary', 
 onClick, 
 disabled, 
 className = '', 
 icon 
}) {
 const baseClasses = "px-6 h-8 font-label text-xs tracking-widest transition-transform flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed";
 
 const variants = {
  primary: "relative bordered-corner flex items-center justify-center text-primary uppercase font-[700] hover:text-primary active:scale-95",
  inverse_primary: "relative bordered-corner-inverse flex items-center justify-center text-secondary uppercase font-[700] hover:text-secondary active:scale-95",
  secondary: "relative bordered-corner-reverse text-primary font-[700] uppercase hover:text-primary active:scale-95",
  tertiary: "relative flex items-center justify-center text-[#12111A] font-[700] uppercase solid-corner active:scale-95",
  danger: "border border-accent-yellow/50 text-accent-yellow hover:bg-accent-yellow/10",
  ghost: "text-primary hover:bg-primary/5"
 };

 return (
  <button 
   onClick={onClick} 
   disabled={disabled}
   className={`${baseClasses} ${variants[variant]} ${className}`}
  >
   {icon && <span className="material-symbols-outlined text-[16px]" data-icon={icon}>{icon}</span>}
   {children}
  </button>
 );
}
