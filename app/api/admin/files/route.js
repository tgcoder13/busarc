import { getJson, setJson, deleteFile } from "@/lib/googleDrive";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        // 1. Remove from Catalog
        let catalog = await getJson("catalog.json") || [];
        const fileEntry = catalog.find(f => f.id === id);

        if (!fileEntry) {
            return NextResponse.json({ error: "File not found in catalog" }, { status: 404 });
        }

        const newCatalog = catalog.filter(f => f.id !== id);
        await setJson("catalog.json", newCatalog);

        // 2. Remove from Google Drive
        if (fileEntry.link) {
            try {
                await deleteFile(fileEntry.link);
            } catch (driveError) {
                console.error("Failed to delete from Google Drive:", driveError.message);
                // We proceed since it's removed from catalog
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete file: " + error.message }, { status: 500 });
    }
}
