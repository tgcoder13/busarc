import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const { courseCode, topicNumber, title, id } = await req.json();

        const catalogStore = getStore("catalog");
        const fileStore = getStore("files");

        // 1. Remove from Catalog
        let catalog = await catalogStore.get("index", { type: "json" }) || [];
        // Filter by the specific ID we added during upload
        const newCatalog = catalog.filter(f => f.id !== id);
        await catalogStore.setJSON("index", newCatalog);

        // 2. Remove Blob (Optional but recommended to save space)
        // Reconstruct Key: course/topic-title
        const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
        const course = sanitize(courseCode.toUpperCase());
        const topic = sanitize(topicNumber);
        const titleSlug = sanitize(title);
        const fileKey = `${course}/${topic}-${titleSlug}`;

        await fileStore.delete(fileKey);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
