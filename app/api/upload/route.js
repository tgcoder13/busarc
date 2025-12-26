import { uploadFile, getJson, setJson } from "@/lib/googleDrive";
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

        // Name for Google Drive
        const fileName = `${course}-${topic}-${titleSlug}-${file.name}`;

        // Upload File (Binary buffer)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const driveFile = await uploadFile(fileName, file.type, buffer, {
            mimeType: file.type,
            originalName: file.name,
            courseCode: metadata.courseCode,
            topicNumber: metadata.topicNumber,
            title: metadata.title
        });

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
            link: driveFile.id, // Using Drive ID as the ref
            webViewLink: driveFile.webViewLink,
            date: new Date().toLocaleDateString()
        };

        const updatedCatalog = [newEntry, ...currentCatalog];
        await setJson("catalog.json", updatedCatalog);

        return NextResponse.json({ success: true, link: newEntry.link });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}
