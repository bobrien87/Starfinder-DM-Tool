import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../media/logo.png';

export default function TopAppBar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="bg-[#0d141d] dark:bg-[#0d141d] flex justify-between items-center w-full px-6 h-24 docked full-width top-0 border-b-2 border-[#c3f5ff]/15 z-50 shrink-0 relative">
      
      {/* Left: Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Starfinder GM Assistant" className="h-[72px] w-auto brightness-200" />
      </div>

      {/* Center: Navigation */}
      <nav className="hidden md:flex gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link to="/players" className={`font-['Space_Grotesk'] uppercase tracking-wider text-sm ${path.includes('/players') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1' : 'text-[#bac8dc] hover:text-[#c3f5ff] transition-colors'}`}>PLAYERS</Link>
        <Link to="/creatures" className={`font-['Space_Grotesk'] uppercase tracking-wider text-sm ${path.includes('/creatures') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1' : 'text-[#bac8dc] hover:text-[#c3f5ff] transition-colors'}`}>CREATURES</Link>
        <Link to="/items" className={`font-['Space_Grotesk'] uppercase tracking-wider text-sm ${path.includes('/items') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1' : 'text-[#bac8dc] hover:text-[#c3f5ff] transition-colors'}`}>ITEMS</Link>
        <Link to="/encounters" className={`font-['Space_Grotesk'] uppercase tracking-wider text-sm ${path.includes('/encounters') ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1' : 'text-[#bac8dc] hover:text-[#c3f5ff] transition-colors'}`}>ENCOUNTERS</Link>
        <Link to="/" className={`font-['Space_Grotesk'] uppercase tracking-wider text-sm ${path === '/' ? 'text-[#c3f5ff] border-b-2 border-[#c3f5ff] pb-1' : 'text-[#bac8dc] hover:text-[#c3f5ff] transition-colors'}`}>ACTIVE ENCOUNTER</Link>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-secondary opacity-30 cursor-not-allowed" title="Notifications (WIP)" data-icon="notifications">notifications</span>
        <span className="material-symbols-outlined text-secondary opacity-30 cursor-not-allowed" title="Settings (WIP)" data-icon="settings">settings</span>
      </div>

    </header>
  );
}
