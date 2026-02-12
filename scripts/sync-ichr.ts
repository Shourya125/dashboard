import 'dotenv/config';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { meiliClient, ICHR_INDEX, initializeMeilisearch } from '../lib/meilisearch';

// Set environment variables for Firebase (since NEXT_PUBLIC_ prefix doesn't work in Node scripts)
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;


async function syncICHRToMeilisearch() {
    console.log('🚀 Starting ICHR sync to Meilisearch...');
    console.log('================================================\n');

    try {
        // Step 1: Initialize Meilisearch settings
        console.log('📋 Step 1: Configuring Meilisearch index...');
        await initializeMeilisearch();
        console.log('');

        // Step 2: Fetch all documents from Firebase
        console.log('📋 Step 2: Fetching documents from Firebase...');
        const snapshot = await getDocs(collection(db, 'ichr'));
        console.log(`✅ Found ${snapshot.size} documents in Firebase ICHR collection\n`);

        if (snapshot.empty) {
            console.log('⚠️  No documents to sync. Exiting.');
            return;
        }

        // Step 3: Transform documents for Meilisearch
        console.log('📋 Step 3: Transforming documents...');
        const documents = snapshot.docs.map(doc => {
            const data = doc.data();

            // Handle Date - could be Timestamp object, number, or string (DD.MM.YYYY)
            let date = Date.now(); // Default fallback

            try {
                if (data.Date) {
                    if (typeof data.Date === 'number') {
                        date = data.Date;
                    } else if (typeof data.Date === 'object' && data.Date.toMillis) {
                        date = data.Date.toMillis();
                    } else if (typeof data.Date === 'object' && data.Date.seconds) {
                        date = data.Date.seconds * 1000;
                    } else if (typeof data.Date === 'string') {
                        // Handle "DD.MM.YYYY" format
                        if (data.Date.includes('.')) {
                            const parts = data.Date.split('.');
                            if (parts.length === 3) {
                                const day = parseInt(parts[0], 10);
                                const month = parseInt(parts[1], 10);
                                const year = parseInt(parts[2], 10);

                                // Create date object (months are 0-indexed)
                                const dateObj = new Date(year, month - 1, day);
                                if (!isNaN(dateObj.getTime())) {
                                    date = dateObj.getTime();
                                }
                            }
                        } else {
                            // Try standard parsing
                            const parsed = Date.parse(data.Date);
                            if (!isNaN(parsed)) date = parsed;
                        }
                    }
                }
            } catch (e) {
                console.warn(`Date parsing error for doc ${doc.id}:`, e);
            }

            // Handle Attachments - could be 'Attachments' (string/array) or 'attachments'
            let attachments = [];
            const rawAttachments = data.Attachments || data.attachments;

            if (rawAttachments) {
                if (Array.isArray(rawAttachments)) {
                    attachments = rawAttachments;
                } else if (typeof rawAttachments === 'string') {
                    attachments = [rawAttachments];
                }
            }

            return {
                id: doc.id,
                title: data.title || '',
                summary: data.summary || '',
                content: data.content || '',
                Place: data.Place || '',
                Date: date,
                site: data.site || '',
                url: data.url || '',
                attachments: attachments
            };
        });
        console.log(`✅ Transformed ${documents.length} documents\n`);

        // Step 4: Upload to Meilisearch in batches
        console.log('📋 Step 4: Uploading to Meilisearch...');
        const index = meiliClient.index(ICHR_INDEX);
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
        console.log('✅ ICHR sync completed successfully!');
        console.log(`📈 Total documents indexed: ${documents.length}`);
        console.log('================================================');

        // Step 5: Verify indexing
        console.log('\n📋 Step 5: Verifying index...');
        const stats = await index.getStats();
        console.log(`✅ Index stats: ${stats.numberOfDocuments} documents indexed`);

    } catch (error) {
        console.error('\n❌ Error syncing ICHR:', error);
        throw error;
    }
}

// Run the sync
syncICHRToMeilisearch()
    .then(() => {
        console.log('\n✨ Sync process completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Sync process failed:', error);
        process.exit(1);
    });
