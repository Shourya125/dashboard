import { NextResponse } from "next/server";
import { meiliClient, LIVELAW_INDEX } from "@/lib/meilisearch";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const queryStr = searchParams.get("query") || "";
    const author = searchParams.get("author") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortParam = searchParams.get("sortBy") || "newest";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limitNum = parseInt(searchParams.get("limit") || "20");

    try {
        const index = meiliClient.index(LIVELAW_INDEX);

        // Build the full-text search query by combining content query + author words
        // This makes author word-searchable (fuzzy, typo-tolerant) instead of exact match
        const searchParts: string[] = [];
        if (queryStr.trim()) searchParts.push(queryStr.trim());
        if (author.trim()) searchParts.push(author.trim());
        const fullSearchQuery = searchParts.join(" ");

        // Build filter array (date filters only)
        const filters: string[] = [];

        if (startDate) {
            // Use start of day (00:00:00.000) to include the entire start date
            const startTimestamp = new Date(startDate + "T00:00:00.000").getTime();
            filters.push(`published_at >= ${startTimestamp}`);
        }

        if (endDate) {
            // Use end of day (23:59:59.999) to include the entire end date
            const endTimestamp = new Date(endDate + "T23:59:59.999").getTime();
            filters.push(`published_at <= ${endTimestamp}`);
        }

        // Search with Meilisearch
        const searchResults = await index.search(fullSearchQuery, {
            offset,
            limit: limitNum,
            filter: filters.length > 0 ? filters.join(' AND ') : undefined,
            sort: sortParam === "oldest"
                ? ['published_at:asc']
                : ['published_at:desc']
        });

        return NextResponse.json({
            documents: searchResults.hits,
            totalHits: searchResults.estimatedTotalHits,
            offset: offset,
            limit: limitNum,
            hasMore: (offset + limitNum) < (searchResults.estimatedTotalHits || 0)
        });
    } catch (error: any) {
        console.error("Livelaw Meilisearch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
