import { NextResponse } from "next/server";
import { meiliClient, ICHR_INDEX } from "@/lib/meilisearch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const index = meiliClient.index(ICHR_INDEX);
        const document = await index.getDocument(id);

        return NextResponse.json(document);
    } catch (error: any) {
        console.error("ICHR document fetch error:", error);
        return NextResponse.json(
            { error: "Document not found" },
            { status: 404 }
        );
    }
}
