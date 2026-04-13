import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQUzqdl4u-Ip5zxrWMloD-CxZbo45o8x8",
  authDomain: "starfinder-dm-tool.firebaseapp.com",
  projectId: "starfinder-dm-tool"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = await getDocs(collection(db, "spells"));
  q.forEach(doc => {
     const data = doc.data();
     if (data.name && data.name.toLowerCase().includes("supercharge")) {
        console.log("SUPERCHARGE WEAPON:");
        console.log(data.description || (data.system && data.system.description ? data.system.description.value : "No desc"));
     }
  });
  console.log("Done checking spells.");
  
  const p = await getDocs(collection(db, "players"));
  p.forEach(doc => {
     const data = doc.data();
     console.log("PLAYER: ", data.characterName, data.spellcasting);
  });
  
  process.exit(0);
}
run();
