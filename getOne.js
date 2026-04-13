import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQUzqdl4u-Ip5zxrWMloD-CxZbo45o8x8",
  projectId: "starfinder-dm-tool",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "creatures"), limit(2));
  const snap = await getDocs(q);
  snap.forEach(doc => {
      console.log(`------------- ${doc.id} -------------`);
      console.log(JSON.stringify(doc.data(), null, 2));
  });
  console.log("Done");
  process.exit(0);
}
run();
