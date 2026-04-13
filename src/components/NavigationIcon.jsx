import React from 'react';

export default function NavigationIcon({ 
  icon, 
  title, 
  onClick, 
  className = "",
  disabled = false
}) {
  return (
    <button 
      onClick={!disabled ? onClick : undefined}
      title={title}
      className={`group
        w-10 h-10 shrink-0 flex items-center justify-center 
        bg-transparent border-2 border-primary text-primary 
        rounded-md 
        [box-shadow:0_0_8px_rgba(87,230,239,0.3),inset_0_0_8px_rgba(87,230,239,0.3)] 
        transition-all duration-200 focus:outline-none
        ${!disabled ? 'cursor-pointer hover:[box-shadow:0_0_12px_rgba(87,230,239,0.3),inset_0_0_12px_rgba(87,230,239,0.3)] hover:bg-primary/10' : 'cursor-not-allowed opacity-40'}
        ${className}
      `}
    >
      <span className="drop-shadow-[0_0_4px_rgba(87,230,239,0.2)] group-hover:drop-shadow-[0_0_8px_rgba(87,230,239,0.4)] transition-all flex items-center justify-center">{typeof icon === 'string' ? <span className="material-symbols-outlined text-[22px]">{icon}</span> : icon}</span>
    </button>
  );
}
