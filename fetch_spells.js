import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQUzqdl4u-Ip5zxrWMloD-CxZbo45o8x8",
  authDomain: "starfinder-dm-tool.firebaseapp.com",
  projectId: "starfinder-dm-tool",
  storageBucket: "starfinder-dm-tool.firebasestorage.app",
  messagingSenderId: "1058311754900",
  appId: "1:1058311754900:web:ce685290fc67ccbd7f5081"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedSpells = [
  {
      name: "Force Barrage",
      level: 1,
      traditions: ["Arcane", "Occult"],
      traits: ["Force", "Magical"],
      castTime: "1 to 3 Actions",
      range: "120 ft.",
      area: "",
      duration: "",
      savingThrow: "",
      damage: "1d4+1 force",
      description: "You shoot a dart of magical force. It automatically hits and deals 1d4+1 force damage."
  },
  {
      name: "Heal",
      level: 1,
      traditions: ["Divine", "Primal"],
      traits: ["Healing", "Magical", "Vitality"],
      castTime: "1 to 3 Actions",
      range: "30 ft.",
      area: "",
      duration: "",
      savingThrow: "",
      damage: "1d8",
      description: "You channel positive energy to heal the living or damage the undead. 1d8 HP per action spent, plus 8 flat if 2 actions are spent."
  },
  {
      name: "Fireball",
      level: 3,
      traditions: ["Arcane", "Primal"],
      traits: ["Fire", "Magical", "Evocation"],
      castTime: "2 Actions",
      range: "500 ft.",
      area: "20-foot burst",
      duration: "",
      savingThrow: "Basic Reflex",
      damage: "6d6 F",
      description: "A roaring blast of fire deals 6d6 fire damage."
  },
  {
      name: "Daze",
      level: 0,
      traditions: ["Arcane", "Divine", "Occult"],
      traits: ["Cantrip", "Enchantment", "Mental", "Nonlethal"],
      castTime: "2 Actions",
      range: "30 ft.",
      area: "",
      duration: "1 round",
      savingThrow: "Will",
      damage: "1d6 mental",
      saveDegrees: {
          criticalSuccess: "The target is unaffected.",
          success: "The target takes half damage.",
          failure: "The target takes full damage.",
          criticalFailure: "The target takes double damage and is stunned 1."
      },
      description: "You cloud the target's mind and jolt their senses."
  },
  {
      name: "Fear",
      level: 1,
      traditions: ["Arcane", "Divine", "Occult", "Primal"],
      traits: ["Emotion", "Fear", "Mental"],
      castTime: "2 Actions",
      range: "30 ft.",
      area: "",
      duration: "",
      savingThrow: "Will",
      saveDegrees: {
          criticalSuccess: "The target is unaffected.",
          success: "The target is frightened 1.",
          failure: "The target is frightened 2.",
          criticalFailure: "The target is fleeing for 1 round and frightened 3."
      },
      description: "You plant a seed of fear in the target."
  },
  {
      name: "Telekinetic Projectile",
      level: 0,
      traditions: ["Arcane", "Occult"],
      traits: ["Attack", "Cantrip", "Evocation"],
      castTime: "2 Actions",
      range: "30 ft.",
      area: "None",
      duration: "None",
      savingThrow: "",
      damage: "1d6+4 B",
      description: "You hurl a loose, unattended object that is within range and that has 1 Bulk or less at the target. Make a spell attack roll against the target."
  }
];

async function run() {
  console.log("Inserting seed spells...");
  for (const data of seedSpells) {
      try {
          const docRef = doc(collection(db, "spells"));
          await setDoc(docRef, data);
          console.log(`Inserted: ${data.name}`);
      } catch (err) {
          console.error("Error inserting spell", err);
      }
  }
  process.exit(0);
}

run();
