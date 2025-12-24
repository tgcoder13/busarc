import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { course, slug } = await params;
    const fileSlug = slug.join('/');
    const key = `${course}/${fileSlug}`;

    try {
        const fileStore = getStore("files");

        // Try getting metadata first to check existence
        const metadata = await fileStore.getMetadata(key);

        if (!metadata) {
            return new Response("File Not Found", { status: 404 });
        }

        // Retrieve as stream for efficient delivery
        const stream = await fileStore.get(key, { type: "stream" });

        return new Response(stream, {
            headers: {
                'Content-Type': metadata.mimeType || 'application/pdf',
                'Content-Disposition': `inline; filename="${metadata.originalName || 'document.pdf'}"`
            }
        });

    } catch (error) {
        console.error("File serve error:", error);
        return new Response("Server Error", { status: 500 });
    }
}
