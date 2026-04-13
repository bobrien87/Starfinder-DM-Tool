import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQUzqdl4u-Ip5zxrWMloD-CxZbo45o8x8",
  projectId: "starfinder-dm-tool",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const creaturesData = [
  {
    name: "Endbringer Swarm", level: 20, hp: 450, sp: 0, resolve: 0,
    senses: ["Darkvision 120ft", "Blindsense 60ft", "Vibration 60ft"],
    languages: ["Aklo", "Telepathy 100ft"],
    immunities: ["Swarm Immunities", "Acid", "Critical Hits", "Precision"],
    resistances: ["Slashing 20", "Piercing 20"],
    weaknesses: ["Area Damage 50%", "Fire 15"],
    attributes: { ac: 42, fort: 29, ref: 31, will: 24 },
    skills: { acrobatics: 36, stealth: 40, survive: 31 },
    traits: ["Swarm", "Aberration", "Mindless"],
    attacks: [
      { weapon: "Swarm Consumption", action: "one-action", baseBonus: 35, damage: "8d10 A", type: "Melee", traits: ["Swarm"], causes: ["Nauseated", "Flat-footed"], description: "The swarm engulfs victims in sheer acid and micro-bites." },
      { weapon: "Acidic Expulsion", action: "two-action", baseBonus: 33, damage: "12d6 A", type: "Ranged", traits: ["Range 40ft"], causes: ["Blinded"], description: "Corrosive acid degrades armor and blinding optics." }
    ]
  },
  {
    name: "Kyton Overlord", level: 19, hp: 380, sp: 0, resolve: 5,
    senses: ["See in Darkness", "Lifesense 60ft"],
    languages: ["Infernal", "Common", "Shadow"],
    immunities: ["Cold", "Pain Effects"],
    resistances: ["Physical 15 (except silver)"],
    weaknesses: ["Good 15"],
    attributes: { ac: 44, fort: 30, ref: 26, will: 32 },
    skills: { intimidate: 38, stealth: 33, mystic: 35 },
    traits: ["Fiend", "Kyton", "Evil", "Lawful"],
    attacks: [
      { weapon: "Shadow Chains", action: "one-action", baseBonus: 35, damage: "4d10+20 S", type: "Melee", traits: ["Reach 20ft", "Trip", "Grapple"], causes: ["Restrained"], description: "Living chains covered in barbs." },
      { weapon: "Unnerving Gaze", action: "reaction", baseBonus: 0, damage: "", type: "Melee", traits: ["Visual", "Aura 30ft"], causes: ["Frightened"], description: "DC 40 Will save or terrified." }
    ],
    spellcasting: [{ tradition: "Divine", type: "Innate", dc: 42, attack: 35, spellsByLevel: { "6": ["Blade Barrier", "True Seeing"], "7": ["Regenerate"] } }]
  },
  {
    name: "Star-Eater Leviathan", level: 22, hp: 600, sp: 0, resolve: 0,
    senses: ["Darkvision 500ft", "Blindsight (gravity) 200ft"],
    languages: [],
    immunities: ["Vacuum", "Cold", "Radiation"],
    resistances: ["All Damage 20"],
    weaknesses: ["Sonic 20"],
    attributes: { ac: 46, fort: 38, ref: 24, will: 33 },
    skills: { athletics: 45, survive: 40 },
    traits: ["Beast", "Gargantuan", "Space"],
    attacks: [
      { weapon: "Gravity Maw", action: "two-action", baseBonus: 38, damage: "14d10+30 B", type: "Melee", traits: ["Reach 30ft"], causes: ["Swallowed Whole"], description: "Bites vessels and creatures entirely." },
      { weapon: "Plasma Breath", action: "three-action", baseBonus: 0, damage: "20d8 E & F", type: "Ranged", traits: ["Line 200ft"], causes: [], description: "DC 45 Reflex for half." }
    ]
  },
  {
    name: "Necrovite Archmage", level: 16, hp: 250, sp: 0, resolve: 7,
    senses: ["Darkvision 60ft", "Lifesense 120ft"],
    languages: ["Common", "Eoxian", "Necril", "Ysoki", "Shirren", "Vesk"],
    immunities: ["Undead Immunities"],
    resistances: ["Cold 10", "Electricity 10"],
    weaknesses: ["Positive 15"],
    attributes: { ac: 34, fort: 21, ref: 26, will: 31 },
    skills: { mystic: 34, computers: 30, physical_science: 28 },
    traits: ["Undead", "Technomancer"],
    attacks: [
      { weapon: "Eoxian Force Staff", action: "one-action", baseBonus: 28, damage: "4d6+15 F", type: "Melee", traits: ["Magical"], causes: [], description: "Channel undead energy." }
    ],
    spellcasting: [{ tradition: "Arcane", type: "Prepared", dc: 39, attack: 31, spellsByLevel: { "6": ["Chain Lightning", "Disintegrate"], "7": ["Control Undead", "Reverse Gravity"], "8": ["Polar Ray"] } }]
  },
  {
    name: "Clockwork Annihilator", level: 17, hp: 310, sp: 0, resolve: 0,
    senses: ["Darkvision 60ft", "Low-light vision"],
    languages: ["Machine Code"],
    immunities: ["Construct Immunities", "Fire"],
    resistances: ["Physical 15 (except adamantine)"],
    weaknesses: ["Electricity 20"],
    attributes: { ac: 42, fort: 32, ref: 24, will: 22 },
    skills: { athletics: 35 },
    traits: ["Construct", "Mindless", "Clockwork"],
    attacks: [
      { weapon: "Adamantine Drill", action: "one-action", baseBonus: 33, damage: "6d12+18 P", type: "Melee", traits: ["Armor Piercing"], causes: ["Bleed"], description: "Bores through shields effortlessly." },
      { weapon: "Incendiary Cannon", action: "two-action", baseBonus: 31, damage: "8d8 F", type: "Ranged", traits: ["Range 120ft", "Burst 20ft"], causes: ["Burning"], description: "Explosive thermal blast." }
    ]
  },
  { name: "Bloodbrother Void-Mutant", level: 15, hp: 300, sp: 0, resolve: 0, senses: ["Darkvision 60ft"], languages: ["Aklo"], immunities: ["Cold"], resistances: ["Acid 10"], weaknesses: ["Fire 15"], attributes: { ac: 36, fort: 28, ref: 22, will: 24 }, skills: { athletics: 30, stealth: 25 }, traits: ["Aberration"], attacks: [{ weapon: "Tentacle Graft", action: "one-action", baseBonus: 30, damage: "4d8+15 B", type: "Melee", traits: ["Reach 15ft", "Grapple"], causes: [], description: "Vampiric drain on grabbed targets." }] },
  { name: "Aeon Guard Executioner", level: 15, hp: 280, sp: 140, resolve: 4, senses: ["Darkvision 60ft"], languages: ["Azlanti", "Common"], immunities: [], resistances: ["Fire 10"], weaknesses: [], attributes: { ac: 38, fort: 26, ref: 28, will: 23 }, skills: { intimidate: 28, athletics: 26 }, traits: ["Humanoid", "Azlanti"], attacks: [{ weapon: "Imperial Heavy Laser Rifle", action: "one-action", baseBonus: 29, damage: "6d8+15 F", type: "Ranged", traits: ["Range 120ft", "Automatic"], causes: ["Burning"], description: "Overcharged setting." }] },
  { name: "Swarm Corruptor", level: 16, hp: 320, sp: 0, resolve: 5, senses: ["Blindsense 60ft"], languages: ["Swarm"], immunities: ["Acid"], resistances: ["Physical 10"], weaknesses: ["Electricity 15"], attributes: { ac: 38, fort: 29, ref: 27, will: 25 }, skills: { acrobatics: 31, stealth: 30 }, traits: ["Monster", "Swarm"], attacks: [{ weapon: "Bone Blades", action: "one-action", baseBonus: 31, damage: "4d10+16 S", type: "Melee", traits: ["Agile", "Sweep"], causes: ["Bleed"], description: "Mutated chitin blades." }] },
  { name: "Astrazoan Null-Agent", level: 15, hp: 240, sp: 120, resolve: 5, senses: ["Darkvision 60ft"], languages: ["Common", "Vesk", "Kasatha"], immunities: [], resistances: [], weaknesses: [], attributes: { ac: 36, fort: 22, ref: 31, will: 26 }, skills: { stealth: 35, bluff: 33, culture: 28 }, traits: ["Aberration", "Shapechanger"], attacks: [{ weapon: "Silenced Advanced Pistol", action: "one-action", baseBonus: 30, damage: "5d6+15 P", type: "Ranged", traits: ["Operative", "Range 60ft"], causes: ["Flat-footed"], description: "Hidden integrated weapon." }] },
  { name: "Vesk Prime Warden", level: 17, hp: 360, sp: 180, resolve: 6, senses: ["Low-light vision"], languages: ["Vesk", "Common"], immunities: ["Fear"], resistances: ["Fire 15"], weaknesses: [], attributes: { ac: 40, fort: 32, ref: 25, will: 26 }, skills: { athletics: 36, intimidate: 34 }, traits: ["Humanoid", "Vesk"], attacks: [{ weapon: "Dosko, Ultra-Plasma", action: "one-action", baseBonus: 34, damage: "6d10+20 P & E", type: "Melee", traits: ["Unwieldy", "Severe Wound"], causes: ["Stunned"], description: "Devastating melee sweeps." }] },
  { name: "Kasathan Void-Dancer", level: 16, hp: 260, sp: 130, resolve: 5, senses: ["Darkvision 60ft"], languages: ["Kasatha", "Common"], immunities: [], resistances: [], weaknesses: [], attributes: { ac: 39, fort: 24, ref: 32, will: 27 }, skills: { acrobatics: 36, mystic: 29 }, traits: ["Humanoid", "Kasatha"], attacks: [{ weapon: "Quad-Solarian Crystals", action: "two-action", baseBonus: 31, damage: "5d8+15 So", type: "Melee", traits: ["Flurry"], causes: ["Off-target"], description: "Flurry of stellar energy." }] },
  { name: "Android God-Host", level: 18, hp: 380, sp: 190, resolve: 6, senses: ["Darkvision 60ft"], languages: ["Common", "Binary"], immunities: ["Disease", "Poison", "Sleep"], resistances: ["Electricity 20"], weaknesses: [], attributes: { ac: 42, fort: 28, ref: 30, will: 34 }, skills: { computers: 40, engineering: 38, mystic: 35 }, traits: ["Humanoid", "Android"], attacks: [{ weapon: "Divine Nanite Surge", action: "one-action", baseBonus: 33, damage: "8d6 E", type: "Ranged", traits: ["Range 120ft", "Homing"], causes: ["Dazzled"], description: "Tracks targets perfectly." }] },
  { name: "Oma (Space Whale)", level: 16, hp: 450, sp: 0, resolve: 0, senses: ["Blindsight (electromagnetic) 1000ft"], languages: [], immunities: ["Vacuum", "Cold"], resistances: ["Electricity 30"], weaknesses: [], attributes: { ac: 36, fort: 35, ref: 21, will: 28 }, skills: { survive: 35 }, traits: ["Magical Beast", "Colossal"], attacks: [{ weapon: "Tail Slap", action: "one-action", baseBonus: 30, damage: "8d10+24 B", type: "Melee", traits: ["Reach 50ft"], causes: ["Prone"], description: "Massive inertia." }] },
  { name: "Shobhad War-Hulk", level: 15, hp: 320, sp: 160, resolve: 4, senses: ["Darkvision 60ft"], languages: ["Shobhad", "Common"], immunities: ["Cold"], resistances: [], weaknesses: [], attributes: { ac: 37, fort: 30, ref: 24, will: 22 }, skills: { athletics: 33, survive: 28 }, traits: ["Humanoid", "Shobhad", "Large"], attacks: [{ weapon: "Heavy Reaction Cannon", action: "one-action", baseBonus: 29, damage: "6d10+15 P", type: "Ranged", traits: ["Penetrating", "Range 150ft"], causes: ["Deafened"], description: "Artillery strikes." }] },
  { name: "Data-Demon (Glitch)", level: 16, hp: 280, sp: 0, resolve: 5, senses: ["Darkvision 120ft", "See in Darkness"], languages: ["Abyssal", "Machine Code"], immunities: ["Electricity", "Mind-affecting"], resistances: ["Acid 10", "Cold 10", "Fire 10"], weaknesses: ["Good 15"], attributes: { ac: 38, fort: 26, ref: 32, will: 24 }, skills: { computers: 38, stealth: 32 }, traits: ["Fiend", "Demon", "Incorporeal"], attacks: [{ weapon: "Corrupted Protocol", action: "one-action", baseBonus: 30, damage: "6d6 E", type: "Melee", traits: ["Touch", "Cyber-Infect"], causes: ["Confused"], description: "Hacks technological implants on hit." }] },
  { name: "Elven Void-Caster", level: 17, hp: 240, sp: 120, resolve: 6, senses: ["Low-light vision"], languages: ["Elven", "Common", "Draconic"], immunities: ["Sleep"], resistances: [], weaknesses: [], attributes: { ac: 38, fort: 24, ref: 28, will: 34 }, skills: { mystic: 37, culture: 30 }, traits: ["Humanoid", "Elf"], attacks: [{ weapon: "Starlight Staff", action: "one-action", baseBonus: 28, damage: "4d6+15 C", type: "Melee", traits: ["Reach", "Magical"], causes: [], description: "Focuses void chill." }], spellcasting: [{ tradition: "Arcane", type: "Innate", dc: 41, attack: 33, spellsByLevel: { "6": ["Freezing Sphere"], "7": ["Cosmic Eddy", "Prismatic Spray"] } }] },
  { name: "Mechanized Bulette", level: 15, hp: 350, sp: 0, resolve: 0, senses: ["Darkvision 60ft", "Tremorsense 120ft"], languages: [], immunities: ["Construct Immunities"], resistances: ["Physical 15"], weaknesses: ["Electricity 10"], attributes: { ac: 42, fort: 31, ref: 22, will: 20 }, skills: { athletics: 34 }, traits: ["Construct", "Earth"], attacks: [{ weapon: "Adamantine Jaws", action: "two-action", baseBonus: 31, damage: "8d8+20 P", type: "Melee", traits: ["Deadly d12", "Grapple"], causes: ["Restrained"], description: "Bites straight through starship hulls." }] },
  { name: "Contagion Wraith", level: 18, hp: 300, sp: 0, resolve: 6, senses: ["Darkvision 60ft", "Lifesense 120ft"], languages: ["Necril"], immunities: ["Undead Immunities", "Incorporeal Immunities"], resistances: ["All 15 (except force and ghost touch)"], weaknesses: ["Positive 20"], attributes: { ac: 40, fort: 25, ref: 31, will: 35 }, skills: { stealth: 38, acrobatics: 34 }, traits: ["Undead", "Incorporeal", "Disease"], attacks: [{ weapon: "Plague Touch", action: "one-action", baseBonus: 34, damage: "6d10 Negative", type: "Melee", traits: ["Incorporeal Touch"], causes: ["Sickened", "Fatigued"], description: "Drains life-force instantly." }] },
  { name: "Akiton Warlord", level: 15, hp: 340, sp: 170, resolve: 5, senses: ["Low-light vision"], languages: ["Common", "Ysoki"], immunities: [], resistances: ["Fire 10"], weaknesses: [], attributes: { ac: 38, fort: 30, ref: 26, will: 24 }, skills: { intimidate: 32, athletics: 30, survival: 28 }, traits: ["Humanoid", "Human"], attacks: [{ weapon: "Supercharged Gravity Hammer", action: "two-action", baseBonus: 30, damage: "6d10+20 B", type: "Melee", traits: ["Sweep", "Knockdown"], causes: ["Prone"], description: "Sends targets flying 20ft." }] },
  { name: "Draconic Null-Wyrm", level: 20, hp: 550, sp: 0, resolve: 7, senses: ["Darkvision 120ft", "Blindsense 60ft"], languages: ["Draconic", "Common", "Telepathy 100ft"], immunities: ["Sleep", "Paralysis", "Cold", "Radiation"], resistances: ["Physical 20", "Magic 20"], weaknesses: ["Fire 20"], attributes: { ac: 46, fort: 36, ref: 29, will: 38 }, skills: { acrobatics: 35, mystics: 40 }, traits: ["Dragon", "Space"], attacks: [{ weapon: "Zero-Kelvin Bite", action: "one-action", baseBonus: 37, damage: "8d10+25 P & C", type: "Melee", traits: ["Reach 20ft"], causes: ["Slowed"], description: "Flash-freezes blood and oil alike." }, { weapon: "Entropy Breath", action: "three-action", baseBonus: 0, damage: "24d6 Negative", type: "Ranged", traits: ["Cone 60ft"], causes: ["Enfeebled"], description: "DC 43 Reflex for half. Erases matter." }] }
];

const playersData = [
  {
    name: "Navasi", level: 20, hp: 140, sp: 200, resolve: 22, stamina: 200, init: 15,
    skills: { diplomacy: 38, bluff: 36, sense_motive: 35, computers: 32 },
    weapons: [
      { name: "Paragon Semi-Auto Pistol", attackBonus: 34, damage: "8d6 P", traits: ["Operative", "Analog", "Injection"] },
      { name: "Vibro-Baton, Advanced", attackBonus: 31, damage: "4d4+10 B", traits: ["Operative", "Stun"] }
    ],
    items: [{ name: "Mk 4 Serum of Healing", quantity: 3 }, { name: "Force Field, Green", quantity: 1 }],
    attributes: { ac: 40, fort: 24, ref: 31, will: 33 },
    traits: ["Human", "Envoy"],
    type: "player"
  },
  {
    name: "Obozaya", level: 20, hp: 180, sp: 240, resolve: 20, stamina: 240, init: 19,
    skills: { athletics: 36, intimidate: 34, survive: 28 },
    weapons: [
      { name: "Elite Dosko", attackBonus: 36, damage: "10d10+25 P", traits: ["Unwieldy", "Severe Wound"] },
      { name: "Paragon Reaction Cannon", attackBonus: 32, damage: "8d10+20 P", traits: ["Penetrating", "Range 150ft"] }
    ],
    items: [{ name: "Mk 3 Grenade, Frag", quantity: 5 }, { name: "Powered Armor Battery", quantity: 2 }],
    attributes: { ac: 43, fort: 34, ref: 26, will: 25 },
    traits: ["Vesk", "Soldier"],
    type: "player"
  },
  {
    name: "Iseph", level: 20, hp: 130, sp: 180, resolve: 21, stamina: 180, init: 24,
    skills: { stealth: 39, acrobatics: 38, computers: 35, sleight_of_hand: 34 },
    weapons: [
      { name: "Ultra-Thin Dagger", attackBonus: 35, damage: "4d4+15 S", traits: ["Operative", "Concealable", "Bleed"] },
      { name: "Paragon Sniper Rifle", attackBonus: 36, damage: "12d8 P", traits: ["Sniper 1000ft", "Unwieldy"] }
    ],
    items: [{ name: "Invisibility Cloak", quantity: 1 }, { name: "Datapad", quantity: 1 }],
    attributes: { ac: 42, fort: 25, ref: 35, will: 28 },
    traits: ["Android", "Operative"],
    type: "player"
  },
  {
    name: "Keskodai", level: 20, hp: 150, sp: 190, resolve: 23, stamina: 190, init: 12,
    skills: { mystic: 38, medicine: 36, culture: 30 },
    weapons: [
      { name: "Staff of the Healing Void", attackBonus: 30, damage: "4d6+15 F", traits: ["Magical", "Reach"] }
    ],
    items: [{ name: "Healing Spell Gem", quantity: 2 }, { name: "Chitin Shell", quantity: 1 }],
    attributes: { ac: 38, fort: 26, ref: 26, will: 36 },
    traits: ["Shirren", "Mystic"],
    spellcasting: [{ tradition: "Divine", type: "Spontaneous", dc: 43, attack: 35, spellsByLevel: { "6": ["Mystic Cure", "Word of Recall", "Mass Suggestion"] } }],
    type: "player"
  }
];

async function wipeAndSeed() {
  console.log("Connecting to Firestore...");

  const collectionsToWipe = ["creatures", "players", "items", "spells"];
  
  for (const colName of collectionsToWipe) {
    console.log(`Wiping ${colName}...`);
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
        console.log(`- ${colName} is already empty.`);
        continue;
    }
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, colName, docSnap.id)));
    await Promise.all(deletePromises);
    console.log(`- Deleted ${snapshot.docs.length} documents from ${colName}.`);
  }

  console.log("Seeding Creatures...");
  const creaturesCol = collection(db, "creatures");
  for (const creature of creaturesData) {
      await addDoc(creaturesCol, creature);
  }
  console.log(`- Added ${creaturesData.length} creatures.`);

  console.log("Seeding Players...");
  const playersCol = collection(db, "players");
  for (const player of playersData) {
      await addDoc(playersCol, player);
  }
  console.log(`- Added ${playersData.length} players.`);

  console.log("Database Seed Complete!");
  process.exit(0);
}

wipeAndSeed().catch(console.error);
