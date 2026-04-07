import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled, 
  className = '', 
  icon 
}) {
  const baseClasses = "px-6 py-2 font-bold font-label text-xs uppercase tracking-widest transition-transform flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-on-primary active:scale-95 glow-primary hover:brightness-110",
    secondary: "border border-primary/40 text-primary hover:bg-primary/10",
    danger: "border border-error/50 text-error hover:bg-error/10",
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
