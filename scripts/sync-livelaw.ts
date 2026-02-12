import 'dotenv/config';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { meiliClient, LIVELAW_INDEX, initializeMeilisearch } from '../lib/meilisearch';

// Set environment variables for Firebase (since NEXT_PUBLIC_ prefix doesn't work in Node scripts)
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;


async function syncLivelawToMeilisearch() {
    console.log('🚀 Starting Livelaw sync to Meilisearch...');
    console.log('================================================\n');

    try {
        // Step 1: Initialize Meilisearch settings
        console.log('📋 Step 1: Configuring Meilisearch index...');
        await initializeMeilisearch();
        console.log('');

        // Step 2: Fetch all documents from Firebase
        console.log('📋 Step 2: Fetching documents from Firebase...');
        const snapshot = await getDocs(collection(db, 'livelaw'));
        console.log(`✅ Found ${snapshot.size} documents in Firebase Livelaw collection\n`);

        if (snapshot.empty) {
            console.log('⚠️  No documents to sync. Exiting.');
            return;
        }

        // Step 3: Transform documents for Meilisearch
        console.log('📋 Step 3: Transforming documents...');
        const documents = snapshot.docs.map(doc => {
            const data = doc.data();

            // Handle published_at - could be Timestamp object or number
            let publishedAt = Date.now();
            if (data.published_at) {
                if (typeof data.published_at === 'number') {
                    publishedAt = data.published_at;
                } else if (data.published_at.toMillis) {
                    publishedAt = data.published_at.toMillis();
                } else if (data.published_at.seconds) {
                    publishedAt = data.published_at.seconds * 1000;
                }
            }

            return {
                id: doc.id,
                title: data.title || '',
                summary: data.summary || '',
                relevance_reason: data.relevance_reason || '',
                author: data.author || '',
                published_at: publishedAt,
                source: data.source || '',
                url: data.url || '',
                confidence_score: data.confidence_score || 0
            };
        });
        console.log(`✅ Transformed ${documents.length} documents\n`);

        // Step 4: Upload to Meilisearch in batches
        console.log('📋 Step 4: Uploading to Meilisearch...');
        const index = meiliClient.index(LIVELAW_INDEX);
        const BATCH_SIZE = 1000;
        const totalBatches = Math.ceil(documents.length / BATCH_SIZE);

        for (let i = 0; i < documents.length; i += BATCH_SIZE) {
            const batch = documents.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

            const task = await index.addDocuments(batch);
            console.log(`  📤 Batch ${batchNumber}/${totalBatches}: Uploaded ${batch.length} documents (Task UID: ${task.taskUid})`);
        }

        console.log('');
        console.log('================================================');
        console.log('✅ Livelaw sync completed successfully!');
        console.log(`📈 Total documents indexed: ${documents.length}`);
        console.log('================================================');

        // Step 5: Verify indexing
        console.log('\n📋 Step 5: Verifying index...');
        const stats = await index.getStats();
        console.log(`✅ Index stats: ${stats.numberOfDocuments} documents indexed`);

    } catch (error) {
        console.error('\n❌ Error syncing Livelaw:', error);
        throw error;
    }
}

// Run the sync
syncLivelawToMeilisearch()
    .then(() => {
        console.log('\n✨ Sync process completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Sync process failed:', error);
        process.exit(1);
    });
