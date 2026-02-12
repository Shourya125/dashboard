import { MeiliSearch } from 'meilisearch';

// Validate environment variables
if (!process.env.MEILISEARCH_HOST) {
    throw new Error('MEILISEARCH_HOST environment variable is not defined');
}

if (!process.env.MEILISEARCH_MASTER_KEY) {
    throw new Error('MEILISEARCH_MASTER_KEY environment variable is not defined');
}

// Initialize Meilisearch client
export const meiliClient = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

// Index names
export const LIVELAW_INDEX = 'livelaw';
export const ICHR_INDEX = 'ichr';

/**
 * Initialize Meilisearch indexes with proper settings
 * This should be run once during setup or deployment
 */
export async function initializeMeilisearch() {
    try {
        console.log('🚀 Initializing Meilisearch indexes...');

        // ========================================
        // Livelaw Index Configuration
        // ========================================
        const livelawIndex = meiliClient.index(LIVELAW_INDEX);

        await livelawIndex.updateSettings({
            // Searchable attributes in priority order
            searchableAttributes: [
                'title',              // Highest priority
                'summary',
                'relevance_reason',
                'author',
                'source'
            ],

            // Attributes that can be used for filtering
            filterableAttributes: [
                'author',
                'published_at',
                'source'
            ],

            // Attributes that can be used for sorting
            sortableAttributes: [
                'published_at'
            ],

            // Ranking rules for relevance scoring
            rankingRules: [
                'words',      // Number of matched query terms
                'typo',       // Fewer typos = higher rank
                'proximity',  // Proximity of query terms
                'attribute',  // Matches in title > summary
                'sort',       // Custom sort order
                'exactness'   // Exact matches rank higher
            ],

            // Typo tolerance configuration
            typoTolerance: {
                enabled: true,
                minWordSizeForTypos: {
                    oneTypo: 4,   // Allow 1 typo for words >= 4 chars
                    twoTypos: 8   // Allow 2 typos for words >= 8 chars
                }
            },

            // Pagination settings
            pagination: {
                maxTotalHits: 10000
            }
        });

        console.log('✅ Livelaw index configured');

        // ========================================
        // ICHR Index Configuration
        // ========================================
        const ichrIndex = meiliClient.index(ICHR_INDEX);

        await ichrIndex.updateSettings({
            // Searchable attributes in priority order
            searchableAttributes: [
                'title',      // Highest priority
                'summary',
                'content',
                'Place',
                'site'
            ],

            // Attributes that can be used for filtering
            filterableAttributes: [
                'Place',
                'Date',
                'site'
            ],

            // Attributes that can be used for sorting
            sortableAttributes: [
                'Date'
            ],

            // Ranking rules for relevance scoring
            rankingRules: [
                'words',
                'typo',
                'proximity',
                'attribute',
                'sort',
                'exactness'
            ],

            // Typo tolerance configuration
            typoTolerance: {
                enabled: true,
                minWordSizeForTypos: {
                    oneTypo: 4,
                    twoTypos: 8
                }
            },

            // Pagination settings
            pagination: {
                maxTotalHits: 10000
            }
        });

        console.log('✅ ICHR index configured');
        console.log('🎉 Meilisearch initialization complete!');

        return { success: true };
    } catch (error) {
        console.error('❌ Error initializing Meilisearch:', error);
        throw error;
    }
}

/**
 * Get Livelaw index
 */
export function getLivelawIndex() {
    return meiliClient.index(LIVELAW_INDEX);
}

/**
 * Get ICHR index
 */
export function getICHRIndex() {
    return meiliClient.index(ICHR_INDEX);
}
