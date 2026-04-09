import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TopAppBar from './components/TopAppBar';
import ActiveEncounter from './pages/ActiveEncounter';
import PlayerListing from './pages/PlayerListing';
import PlayerDetail from './pages/PlayerDetail';
import CreatureListing from './pages/CreatureListing';
import CreatureDetail from './pages/CreatureDetail';
import EncounterListing from './pages/EncounterListing';
import EncounterDetail from './pages/EncounterDetail';
import ItemListing from './pages/ItemListing';
import ItemDetail from './pages/ItemDetail';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#162130] to-[#0d141d] text-[#dce3f0] font-body overflow-hidden flex flex-col">
      <TopAppBar />
      <div className="flex-1 relative overflow-hidden flex justify-center">
        <div className="w-full max-w-[1280px] h-full relative">
          <Routes>
            <Route path="/" element={<ActiveEncounter />} />
            <Route path="/players" element={<PlayerListing />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/creatures" element={<CreatureListing />} />
            <Route path="/creatures/:id" element={<CreatureDetail />} />
            <Route path="/items" element={<ItemListing />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/encounters" element={<EncounterListing />} />
            <Route path="/encounters/:id" element={<EncounterDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
