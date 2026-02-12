import { db } from "./lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function test() {
    console.log("Testing Firebase Connection...");
    console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);

    try {
        const collections = ["livilaw", "livelaw", "ichr"];
        for (const name of collections) {
            const snap = await getDocs(collection(db, name));
            console.log(`Collection '${name}': ${snap.size} documents`);
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
