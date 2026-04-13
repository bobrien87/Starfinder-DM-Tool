import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../media/logo.png';
import NavigationIcon from './NavigationIcon';
import SettingsModal from './SettingsModal';

export default function TopAppBar() {
 const location = useLocation();
 const path = location.pathname;
 const [settingsOpen, setSettingsOpen] = useState(false);

 return (
  <header className="bg-transparent flex justify-between items-center w-full px-6 h-24 docked full-width top-0 z-50 shrink-0 relative">
   
   {/* Left: Logo */}
   <div className="flex items-center">
    <img src={logo} alt="Starfinder GM Assistant" className="h-[72px] w-auto brightness-200" />
   </div>

   {/* Center: Navigation */}
   <nav className="hidden md:flex gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    {[
      { to: '/players', label: 'PLAYERS' },
      { to: '/creatures', label: 'CREATURES' },
      { to: '/items', label: 'ITEMS' },
      { to: '/encounters', label: 'ENCOUNTERS' },
      { to: '/', label: 'ACTIVE ENCOUNTER' },
      { to: '/style-guide', label: 'STYLE GUIDE' }
    ].map(link => {
      const isActive = link.to === '/' ? path === '/' : path.includes(link.to);
      return (
        <Link 
          key={link.to}
          to={link.to} 
          className={`nav-link ${isActive ? 'text-primary [text-shadow:0_0_16px_rgba(87,230,239,0.5)]' : ''}`}
        >
          {link.label}
        </Link>
      );
    })}
   </nav>

   {/* Right: Actions */}
   <div className="flex items-center gap-4 relative z-[60]">
    <NavigationIcon icon="notifications" title="Notifications (WIP)" disabled={true} />
    <div onClick={() => setSettingsOpen(true)} className="cursor-pointer">
      <NavigationIcon icon="settings" title="Configuration Settings" />
    </div>
   </div>

   {/* Settings Modal Layer */}
   {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

  </header>
 );
}
