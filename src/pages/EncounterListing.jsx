import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import Button from '../components/Button';

export default function EncounterListing() {
 const { encounters, players, creatures, getEntity, createEntity, updateEntity, deleteEntity } = useDatabase();
 const navigate = useNavigate();

 const handleCreate = async () => {
  const pcCombatants = (players || []).map(p => ({
    instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    refId: p.id,
    type: 'PC',
    name: p.characterName || p.name || 'Unknown PC',
    initiative: 0,
    isDelaying: false,
    isDefeated: false,
    hp: null,
    conditions: []
  }));

  const docRef = await createEntity('encounters', { 
    title: "New Encounter", 
    type: "Combat", 
    status: "Planned", 
    xpBudget: 0, 
    environment: "Unknown Sector",
    combatants: pcCombatants,
    activeTurnId: null,
    round: 1
  });
  navigate(`/encounters/${docRef.id}`, { state: { edit: true } });
 };

 const handleRun = async (e, id) => {
  e.preventDefault();
  await updateEntity('encounters', id, { status: 'Active' });
  navigate('/');
 };



 return (
  <main className="page-layout-wrapper">
   <div className="flex justify-between items-end border-b pb-4 border-tertiary/30">
    <div>
     <h1>Encounters</h1>
   <p className="text-off-white font-label text-xs tracking-widest opacity-70">Combat Scenarios and Hazards</p>
    </div>
    <div className="flex gap-4 items-center">
      <Button variant="primary" onClick={handleCreate}>Create Encounter</Button>
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {encounters.map((e) => {
     const pcCombatants = e.combatants?.filter(c => c.type === 'PC') || [];
     const creatureCombatants = e.combatants?.filter(c => c.type === 'NPC' || c.type === 'Creature') || [];
     
     const getPartyLevel = () => {
      if (pcCombatants.length === 0) return 1;
      let totalLevels = 0;
      pcCombatants.forEach(c => {
        const p = getEntity('players', c.refId);
        totalLevels += (Number(p?.level) || 1);
      });
      return Math.round(totalLevels / pcCombatants.length);
     };

     const PL = getPartyLevel();
     const numPCs = pcCombatants.length === 0 ? 4 : pcCombatants.length;
     const adjust = numPCs - 4;

     const baseBudgets = {
       Trivial: 40 + (adjust * 10),
       Low: 60 + (adjust * 15),
       Moderate: 80 + (adjust * 20),
       Severe: 120 + (adjust * 30),
       Extreme: 160 + (adjust * 40)
     };

     const getCreatureXP = (cLevel, pLevel) => {
       const diff = cLevel - pLevel;
       if (diff <= -4) return 10;
       if (diff === -3) return 15;
       if (diff === -2) return 20;
       if (diff === -1) return 30;
       if (diff === 0) return 40;
       if (diff === 1) return 60;
       if (diff === 2) return 80;
       if (diff === 3) return 120;
       if (diff >= 4) return 160;
       return 0;
     };

     const currentTotalXP = creatureCombatants.reduce((sum, c) => {
       const dbCreature = getEntity('creatures', c.refId);
       const cLvl = Number(dbCreature?.level) || 1;
       return sum + getCreatureXP(cLvl, PL);
     }, 0);

     const getThreatLevel = (xp) => {
       if (xp < baseBudgets.Low) return { name: 'Trivial', color: 'text-primary border-outline-variant/30' };
       if (xp < baseBudgets.Moderate) return { name: 'Low', color: 'text-primary bg-primary/10 border-primary/30' };
       if (xp < baseBudgets.Severe) return { name: 'Moderate', color: 'text-[#ffb142] bg-[#ffb142]/10 border-[#ffb142]/30' };
       if (xp < baseBudgets.Extreme) return { name: 'Severe', color: 'text-[#ff5252] bg-[#ff5252]/10 border-[#ff5252]/30' };
       return { name: 'Extreme', color: 'text-[#c23616] bg-[#c23616]/20 border-[#c23616]/50' };
     };

     const threat = getThreatLevel(currentTotalXP);

     return (
     <div key={e.id} className="border border-outline-variant/20 relative flex flex-col">
      <div className={`absolute top-0 left-0 w-1 h-full ${e.status === 'Active' ? 'bg-primary' : 'bg-outline-variant/50'}`}></div>
      
      <div className="p-6 pb-4 flex justify-between items-start gap-4 flex-1">
       <div className="flex flex-col items-start gap-3 flex-1">
    <h4 className="text-xl font-headline text-off-white tracking-tight leading-none">{e.title}</h4>
        {(e.status === 'Active' || e.activeTurnId !== null || e.round > 1) && (
     <span className={`px-2 py-0.5 text-[9px] font-label border ${e.status === 'Active' ? 'bg-primary/20 border-primary/50 text-primary glow-primary' : 'border-outline-variant/30 text-primary'}`}>
           {e.status === 'Active' ? 'Active' : 'Paused'}
          </span>
        )}
       </div>
       
       <div className="flex gap-2 shrink-0">
         <Button variant="ghost" className="!px-3 !py-1 !text-[12px]" onClick={() => navigate(`/encounters/${e.id}`)}>Edit</Button>
         <Button variant="secondary" className="!px-3 !py-1 !text-[12px]" icon="play_arrow" onClick={(event) => handleRun(event, e.id)}>Run</Button>
       </div>
      </div>
      
      <div className="p-4 flex justify-between items-center border-t border-tertiary/30">
        <div>
     <span className="block text-[12px] font-label text-primary tracking-widest mb-1">Total XP</span>
         <span className="text-xl font-headline text-primary leading-none">{currentTotalXP}</span>
        </div>
    <div className={`px-3 py-1 tracking-widest text-[12px] ${threat.color} border`}>
         {threat.name} Threat
        </div>
      </div>
     </div>
    )})}
   </div>
  </main>
 );
}
