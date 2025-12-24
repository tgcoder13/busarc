import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const metadata = JSON.parse(formData.get("metadata"));

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Initialize Blobs stores
        const fileStore = getStore("files");
        const catalogStore = getStore("catalog");

        // Clean names for safe keys
        const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
        const course = sanitize(metadata.courseCode.toUpperCase());
        const topic = sanitize(metadata.topicNumber);
        const titleSlug = sanitize(metadata.title);

        // Key: course/topic-title
        const fileKey = `${course}/${topic}-${titleSlug}`;

        // Upload File (Binary)
        const arrayBuffer = await file.arrayBuffer();
        // Upload as raw binary, setting metadata for retrieval
        await fileStore.set(fileKey, arrayBuffer, {
            metadata: {
                mimeType: file.type,
                originalName: file.name
            }
        });

        // Update Catalog (List of all files)
        const currentCatalog = await catalogStore.get("index", { type: "json" }) || [];
        const newEntry = {
            id: Date.now(),
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2),
            courseCode: metadata.courseCode.toUpperCase(),
            topicNumber: metadata.topicNumber,
            title: metadata.title,
            link: `${course}/${topic}-${titleSlug}`, // Logical path
            date: new Date().toLocaleDateString()
        };

        const updatedCatalog = [newEntry, ...currentCatalog];
        await catalogStore.setJSON("index", updatedCatalog);

        return NextResponse.json({ success: true, link: newEntry.link });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
