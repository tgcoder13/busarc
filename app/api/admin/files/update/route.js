import { getJson, setJson } from "@/lib/googleDrive";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { id, courseCode, topicNumber, title } = await req.json();

        let catalog = await getJson("catalog.json") || [];
        const index = catalog.findIndex(f => f.id === id);

        if (index !== -1) {
            // Update fields
            catalog[index].courseCode = courseCode;
            catalog[index].topicNumber = topicNumber;
            catalog[index].title = title;

            await setJson("catalog.json", catalog);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "File not found" }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: "Update failed: " + e.message }, { status: 500 });
    }
}
