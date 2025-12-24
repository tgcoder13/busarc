import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { id, courseCode, topicNumber, title } = await req.json();
        const archiveStore = getStore("archives");

        let archives = await archiveStore.get("list", { type: "json" }) || [];
        const index = archives.findIndex(f => f.id === id);

        if (index !== -1) {
            // Update fields
            archives[index].courseCode = courseCode;
            archives[index].topicNumber = topicNumber;
            archives[index].title = title;

            await archiveStore.setJSON("list", archives);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "File not found" }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
