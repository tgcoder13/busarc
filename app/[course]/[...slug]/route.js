import { getJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { course, slug } = await params;
    const fileSlug = slug.join('/');
    const logicalPath = `${course}/${fileSlug}`;

    try {
        // 1. Find file URL from catalog
        const catalog = await getJson("catalog.json") || [];
        const fileEntry = catalog.find(f => f.logicalPath === logicalPath);

        if (!fileEntry || !fileEntry.link) {
            return new Response("File Not Found", { status: 404 });
        }

        // 2. Redirect to Vercel Blob URL (Direct download/view)
        return NextResponse.redirect(fileEntry.link);

    } catch (error) {
        console.error("File serve error:", error);
        return new Response("Server Error: " + error.message, { status: 500 });
    }
}
