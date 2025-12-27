import { put, setJson, getJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req) {
    let currentStep = "Initializing";
    try {
        currentStep = "Parsing Form Data";
        const formData = await req.formData();
        const file = formData.get("file");
        const metadataStr = formData.get("metadata");

        if (!file || !metadataStr) {
            return NextResponse.json({ error: "Missing file or metadata" }, { status: 400 });
        }

        const metadata = JSON.parse(metadataStr);
        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Upload to Blob
        currentStep = "Uploading to Vercel Blob";
        const url = await put(file.name, buffer, {
            access: 'public',
            contentType: file.type,
            addRandomSuffix: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        // 2. Update Catalog
        currentStep = "Updating Catalog";
        let catalog = await getJson("catalog.json") || [];

        const newEntry = {
            id: Date.now().toString(),
            courseCode: metadata.courseCode,
            topicNumber: metadata.topicNumber,
            title: metadata.title,
            fileName: file.name,
            link: url.url, // Correctly store the Vercel URL
            uploadedAt: new Date().toISOString()
        };

        catalog.unshift(newEntry);
        await setJson("catalog.json", catalog);

        return NextResponse.json({ success: true, link: url.url });

    } catch (error) {
        console.error(`[Upload Error] ${currentStep}:`, error.message);
        return NextResponse.json({
            error: "Upload failed",
            step: currentStep,
            details: error.message
        }, { status: 500 });
    }
}
