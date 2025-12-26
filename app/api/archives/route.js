import { getJson } from "@/lib/googleDrive";
import { NextResponse } from "next/server";

// Force dynamic requirement for Netlify function behavior
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let catalog = [];
        try {
            catalog = await getJson("catalog.json") || [];
        } catch (storeError) {
            console.warn("Google Drive Store not available or error:", storeError.message);
        }

        return NextResponse.json(catalog);
    } catch (error) {
        console.error("Archive fetch error:", error);
        // Return empty array fallback if store doesn't exist yet
        return NextResponse.json([]);
    }
}
