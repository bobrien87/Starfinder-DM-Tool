import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import Button from '../components/Button';

export default function PlayerListing() {
 const { players, createEntity, deleteEntity } = useDatabase();
 const navigate = useNavigate();

 const handleCreate = async () => {
  const docRef = await createEntity('players', { 
    characterName: "New PC", 
    playerName: "Player", 
    level: 1, 
    ancestry: "Human", 
    class: "Envoy",
    hp: { current: 10, max: 10, temp: 0 },
    stamina: { current: 10, max: 10 },
    resolve: { current: 3, max: 3 }
  });
  navigate(`/players/${docRef.id}`, { state: { edit: true } });
 };

 const handleImportIconics = async () => {
   if (!window.confirm("Import Starfinder 2e Iconics (Level 1) from Foundry VTT?")) return;
   const iconics = [
    { characterName: "Iseph", playerName: "Pregen", level: 1, ancestry: "Android", class: "Operative", hp: { current: 16, max: 16 } },
    { characterName: "Navasi", playerName: "Pregen", level: 1, ancestry: "Human", class: "Envoy", hp: { current: 16, max: 16 } },
    { characterName: "Obozaya", playerName: "Pregen", level: 1, ancestry: "Vesk", class: "Soldier", hp: { current: 22, max: 22 } },
    { characterName: "Zemir", playerName: "Pregen", level: 1, ancestry: "Human", class: "Witchwarper", hp: { current: 14, max: 14 } },
    { characterName: "Dae", playerName: "Pregen", level: 1, ancestry: "Shirren", class: "Solarian", hp: { current: 18, max: 18 } }
   ];
   for (const i of iconics) { await createEntity('players', i); }
 };

 const handleCopyLink = () => {
  navigator.clipboard.writeText("starfinder.app/invite/abcxyz");
  alert("Invite link copied to clipboard!");
 };

 return (
  <main className="page-layout-wrapper">
   <div className="flex justify-between items-end border-b pb-4 border-tertiary/30">
    <div>
     <h1>Players</h1>
   <p className="text-off-white font-label text-xs tracking-widest opacity-70">{players.length} Active Characters</p>
    </div>
    <div className="flex gap-4 items-center flex-wrap justify-end">
     <div 
      onClick={handleCopyLink}
      className="border border-primary/20 px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-primary/5 transition-colors"
     >
   <span className="text-[12px] font-label text-primary ">Invite Link:</span>
      <code className="text-xs text-primary font-mono">starfinder.app/invite/abcxyz</code>
      <span className="material-symbols-outlined text-[16px] text-primary" data-icon="content_copy">content_copy</span>
     </div>
     <Button variant="secondary" onClick={handleImportIconics}>Import Foundry Iconics</Button>
     <Button variant="primary" onClick={handleCreate}>Create PC</Button>
    </div>
   </div>

   <div className="flex flex-col gap-3">
    {players.map((p) => (
     <Link to={`/players/${p.id}`} key={p.id} className="corner-cut p-4 border-l-2 border-primary relative flex items-center justify-between gap-6 hover:transition-colors group cursor-pointer block">
      


      <div className="flex-1">
    <h4 className="text-xl font-headline text-off-white tracking-tight leading-none group-hover:text-white transition-colors">{p.characterName}</h4>
    <p className="text-[12px] text-off-white font-label tracking-widest mt-1">Level {p.level} • {p.build?.ancestry?.name || p.ancestry || ''} • {p.build?.class?.name || p.class || ''}</p>
      </div>

      <div className="flex-1 text-center hidden md:block">
    <p className="text-[12px] text-off-white font-label tracking-widest ">Played By</p>
        <p className="text-sm text-off-white ">{p.playerName}</p>
      </div>

      <div className="text-center pr-6 hidden sm:block">
    <div className="text-[12px] font-label text-primary ">Hit Points</div>
       <div className="text-xl font-headline text-primary leading-none mt-1">{p.hp?.current} <span className="text-sm font-normal opacity-50">/ {p.hp?.max}</span></div>
      </div>
      
      <div className="pl-2">
       <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors text-[24px]" data-icon="chevron_right">chevron_right</span>
      </div>
     </Link>
    ))}
   </div>
  </main>
 );
}
