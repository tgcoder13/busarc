import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

// Force dynamic requirement for Netlify function behavior
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const catalogStore = getStore("catalog");
        const catalog = await catalogStore.get("index", { type: "json" }) || [];

        return NextResponse.json(catalog);
    } catch (error) {
        console.error("Archive fetch error:", error);
        // Return empty array fallback if store doesn't exist yet
        return NextResponse.json([]);
    }
}
