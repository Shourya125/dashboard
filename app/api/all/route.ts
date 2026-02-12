import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export async function GET() {
    try {
        // Fetch only latest 3 from each to keep homepage fast
        const livelawQuery = query(
            collection(db, "livelaw"),
            orderBy("published_at", "desc"),
            limit(3)
        );
        const ichrQuery = query(
            collection(db, "ichr"),
            orderBy("Date", "desc"),
            limit(3)
        );

        const [livelawSnapshot, ichrSnapshot] = await Promise.all([
            getDocs(livelawQuery),
            getDocs(ichrQuery)
        ]);

        const livelawDocs = livelawSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const ichrDocs = ichrSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            livelaw: livelawDocs,
            ichr: ichrDocs,
            total: livelawDocs.length + ichrDocs.length
        });
    } catch (error: any) {
        console.error("Error fetching homepage summary:", error);
        return NextResponse.json({
            error: "Failed to fetch summary data",
            details: error.message
        }, { status: 500 });
    }
}
