import { NextResponse } from "next/server";
import { meiliClient, LIVELAW_INDEX, ICHR_INDEX } from "@/lib/meilisearch";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const queryStr = searchParams.get("query") || "";
    const site = searchParams.get("site") || ""; // "livelaw", "ichr", or "" for both
    const sortParam = searchParams.get("sortBy") || ""; // "newest", "oldest", or "" for relevance
    const limitNum = parseInt(searchParams.get("limit") || "20");

    try {
        const livelawIndex = meiliClient.index(LIVELAW_INDEX);
        const ichrIndex = meiliClient.index(ICHR_INDEX);

        const searchLivelaw = !site || site === "livelaw";
        const searchICHR = !site || site === "ichr";

        // Build sort options
        const livelawSort = sortParam === "oldest"
            ? ['published_at:asc']
            : sortParam === "newest"
                ? ['published_at:desc']
                : undefined;

        const ichrSort = sortParam === "oldest"
            ? ['Date:asc']
            : sortParam === "newest"
                ? ['Date:desc']
                : undefined;

        // Run searches in parallel (only for selected indexes)
        const [livelawResults, ichrResults] = await Promise.all([
            searchLivelaw
                ? livelawIndex.search(queryStr, {
                    limit: limitNum,
                    attributesToHighlight: ['title', 'summary', 'relevance_reason', 'source'],
                    showRankingScore: true,
                    sort: livelawSort
                })
                : Promise.resolve({ hits: [], estimatedTotalHits: 0 }),
            searchICHR
                ? ichrIndex.search(queryStr, {
                    limit: limitNum,
                    attributesToHighlight: ['title', 'summary', 'content', 'site'],
                    showRankingScore: true,
                    sort: ichrSort
                })
                : Promise.resolve({ hits: [], estimatedTotalHits: 0 })
        ]);

        // Tag results with their source type for the frontend
        const livelawHits = livelawResults.hits.map(hit => ({
            ...hit,
            _type: 'livelaw' as const,
            _score: (hit as any)._rankingScore || 0,
            _timestamp: (hit as any).published_at || 0
        }));

        const ichrHits = ichrResults.hits.map(hit => ({
            ...hit,
            _type: 'ichr' as const,
            _score: (hit as any)._rankingScore || 0,
            _timestamp: (hit as any).Date || 0
        }));

        let allResults = [...livelawHits, ...ichrHits];

        // Sort logic: if sortBy is specified, sort by timestamp; otherwise sort by relevance score
        if (sortParam === "newest") {
            allResults.sort((a, b) => (b._timestamp || 0) - (a._timestamp || 0));
        } else if (sortParam === "oldest") {
            allResults.sort((a, b) => (a._timestamp || 0) - (b._timestamp || 0));
        } else {
            // Default: sort by relevance score
            allResults.sort((a, b) => (b._score || 0) - (a._score || 0));
        }

        return NextResponse.json({
            results: allResults,
            counts: {
                livelaw: livelawResults.estimatedTotalHits,
                ichr: ichrResults.estimatedTotalHits
            }
        });

    } catch (error: any) {
        console.error("Global search error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
