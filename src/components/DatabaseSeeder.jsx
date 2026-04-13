import React, { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function DatabaseSeeder() {
 const [status, setStatus] = useState('Idle');

 const seedDatabase = async () => {
  setStatus('Seeding... Please wait.');
  try {
   // 1. Seed Items (Weapons & Armor)
   const weaponRef = doc(collection(db, 'items'), 'laser_pistol_1');
   await setDoc(weaponRef, {
    name: 'Laser Pistol',
    level: 1,
    type: 'Weapon',
    bulk: 'L',
    price: 250,
    description: 'A standard-issue tactical energy weapon.',
    traits: ['Analog'],
    weaponData: {
     damage: '1d6 F',
     category: 'Simple',
     group: 'Laser',
     range: '80 ft.',
     capacity: 20,
     usage: 1,
     reload: '1 Action'
    }
   });

   // 2. Seed Spells
   const spellRef = doc(collection(db, 'spells'), 'logic_bomb_1');
   await setDoc(spellRef, {
    name: 'Logic Bomb',
    level: 3,
    traditions: ['Arcane', 'Tech'],
    castTime: '2 Actions',
    range: '60 ft.',
    area: '20-foot burst',
    target: 'Electronic Systems',
    duration: 'Instantaneous',
    savingThrow: 'Basic Reflex DC',
    description: 'You unleash a localized blast of cascading code and energy.',
    traits: ['Tech', 'Electricity', 'Evocation']
   });

   // 3. Seed Players
   const playerRef = doc(collection(db, 'players'), 'pc_vesk_soldier');
   await setDoc(playerRef, {
    characterName: 'Kragar',
    playerName: 'Dan',
    ancestry: 'Vesk',
    class: 'Soldier',
    level: 4,
    traits: ['Humanoid', 'Vesk'],
    hp: { current: 48, max: 48, temp: 0 },
    ac: 21,
    saves: { fortitude: 12, reflex: 8, will: 7 },
    speeds: [{ type: 'land', value: 25 }],
    conditions: [],
    heroPoints: 1,
    inventory: [
      { itemId: 'laser_pistol_1', quantity: 1, equipped: true }
    ],
    spells: [],
    weapons: [ { itemId: 'laser_pistol_1', equipped: true } ]
   });

   // 4. Seed Creatures
   const creatureRef = doc(collection(db, 'creatures'), 'npc_android_technomancer');
   await setDoc(creatureRef, {
    name: 'Android Technomancer',
    level: 8,
    description: 'A rogue synth casting digital curses.',
    traits: ['Construct', 'Android', 'Humanoid'],
    perception: 16,
    speeds: [{ type: 'land', value: 25 }],
    hp: { current: 82, max: 82, temp: 0 },
    ac: 26,
    saves: { fortitude: 12, reflex: 14, will: 11 },
    attacks: [
     { weapon: 'Laser Pistol', type: 'Ranged', bonus: 18, damage: '2d6+4 F', traits: ['Analog'] },
     { weapon: 'Tactical Baton', type: 'Melee', bonus: 14, damage: '2d4+2 B', traits: ['Agile'] }
    ],
    spellcasting: {
     dc: 26,
     attack: 18,
     tradition: 'Arcane',
     type: 'Prepared',
     spellSlots: [
       { level: 3, spellIds: ['logic_bomb_1'], slots: 2 }
     ]
    },
    items: ['laser_pistol_1']
   });

   // 5. Seed Encounter
   const encounterRef = doc(collection(db, 'encounters'), 'encounter_ambush_1');
   await setDoc(encounterRef, {
    title: 'Abyssal Reach Outpost',
    type: 'Combat',
    status: 'Active',
    round: 4,
    activeTurnId: 'npc_android_technomancer',
    combatants: [
      {
       instanceId: 'creature_instance_1',
       refId: 'npc_android_technomancer',
       type: 'Creature',
       name: 'Android Technomancer',
       initiative: 28,
       hp: { current: 54, max: 82, temp: 0 },
       conditions: [],
       isDelaying: false,
       isDefeated: false
      },
      {
       instanceId: 'pc_instance_1',
       refId: 'pc_vesk_soldier',
       type: 'PC',
       name: 'Kragar',
       initiative: 19,
       isDelaying: false,
       isDefeated: false
      }
    ]
   });

   setStatus('Seeding Complete! You can now safely remove this component or hide it.');
  } catch (e) {
   console.error(e);
   setStatus('Error: check console.');
  }
 };

 return (
  <div className="fixed bottom-4 right-4 bg-tertiary p-4 rounded-xl border-2 border-t-2ertiary/50 shadow-lg z-50 text-on-tertiary">
  <h4 className="text-sm mb-2">Dev DB Seeder</h4>
   <p className="text-xs mb-3">Push dummy data directly into Firebase?</p>
  <button onClick={seedDatabase} className="bg-black/30 hover:bg-black/50 px-4 py-2 rounded text-xs tracking-widest transition-colors w-full">
     {status}
   </button>
  </div>
 );
}
