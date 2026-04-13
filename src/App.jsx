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
import StyleGuide from './pages/StyleGuide';
import './index.css';

function App() {
  return (
    <div className="h-screen bg-gradient-to-b from-[#2E181B] to-[#0D1216] text-off-white font-body overflow-hidden flex flex-col">
      <TopAppBar />
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-[1280px] h-full flex flex-col relative">
          <div className="flex-1 w-full min-h-0 flex flex-col">
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
              <Route path="/style-guide" element={<StyleGuide />} />
            </Routes>
          </div>
          
          {/* Global Footer Block - Persistent! */}
          <footer className="h-16 shrink-0 w-full" id="global-footer"></footer>
        </div>
      </div>
    </div>
  );
}

export default App;
