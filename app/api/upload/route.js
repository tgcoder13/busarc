import { uploadFile, getJson, setJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const metadata = JSON.parse(formData.get("metadata"));

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Clean names for safe keys
        const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
        const course = sanitize(metadata.courseCode.toUpperCase());
        const topic = sanitize(metadata.topicNumber);
        const titleSlug = sanitize(metadata.title);

        // Name for Vercel Blob
        const fileName = `${course}-${topic}-${titleSlug}-${file.name}`;

        // Upload File to Vercel Blob
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const blobUrl = await uploadFile(fileName, buffer, file.type);

        // Update Catalog (List of all files)
        const currentCatalog = await getJson("catalog.json") || [];
        const newEntry = {
            id: Date.now(),
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2),
            courseCode: metadata.courseCode.toUpperCase(),
            topicNumber: metadata.topicNumber,
            title: metadata.title,
            logicalPath: `${course}/${topic}-${titleSlug}`, // Logical path for routing
            link: blobUrl, // Using Vercel Blob URL as the ref
            date: new Date().toLocaleDateString()
        };

        const updatedCatalog = [newEntry, ...currentCatalog];
        await setJson("catalog.json", updatedCatalog);

        return NextResponse.json({ success: true, link: newEntry.link });
    } catch (error) {
        console.error("Critical Upload Error:", error);
        return NextResponse.json({
            error: "Upload failed",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
