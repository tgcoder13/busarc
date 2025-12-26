import { uploadFile, getJson, setJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req) {
    let currentStep = "Initializing";
    try {
        currentStep = "Parsing FormData";
        const formData = await req.formData();
        const file = formData.get("file");
        const metadataString = formData.get("metadata");

        if (!file) {
            console.warn("[Upload] Missing 'file' in formData");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!metadataString) {
            console.warn("[Upload] Missing 'metadata' in formData");
            return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
        }

        const metadata = JSON.parse(metadataString);

        // Clean names for safe keys
        const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
        const course = sanitize(metadata.courseCode.toUpperCase());
        const topic = sanitize(metadata.topicNumber);
        const titleSlug = sanitize(metadata.title);

        const fileName = `${course}-${topic}-${titleSlug}-${file.name}`;

        currentStep = "Preparing Buffer";
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        currentStep = "Uploading to Vercel Blob";
        const blobUrl = await uploadFile(fileName, buffer, file.type);

        currentStep = "Retrieving Catalog";
        let currentCatalog = [];
        try {
            currentCatalog = await getJson("catalog.json") || [];
        } catch (e) {
            console.error("[Upload] Catalog retrieval specifically failed:", e.message);
            // We continue as it might be the first file
        }

        currentStep = "Updating Catalog Entry";
        const newEntry = {
            id: Date.now(),
            fileName: file.name,
            fileSize: (file.size / 1024 / 1024).toFixed(2),
            courseCode: metadata.courseCode.toUpperCase(),
            topicNumber: metadata.topicNumber,
            title: metadata.title,
            logicalPath: `${course}/${topic}-${titleSlug}`,
            link: blobUrl,
            date: new Date().toLocaleDateString()
        };

        const updatedCatalog = [newEntry, ...currentCatalog];

        currentStep = "Saving Catalog";
        await setJson("catalog.json", updatedCatalog);

        console.log(`[Upload] Process complete for ${file.name}`);
        return NextResponse.json({ success: true, link: newEntry.link });
    } catch (error) {
        console.error(`[Upload] CRITICAL ERROR at step [${currentStep}]:`, error);
        return NextResponse.json({
            error: "Upload failed",
            step: currentStep,
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
