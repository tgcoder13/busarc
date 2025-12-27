import { getJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const catalog = await getJson("catalog.json") || [];
        return NextResponse.json(catalog);
    } catch (error) {
        console.error("Archive fetch error:", error);
        return NextResponse.json([]);
    }
}
