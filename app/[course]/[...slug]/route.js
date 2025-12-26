import { getJson, getDriveClient } from "@/lib/googleDrive";

export async function GET(req, { params }) {
    const { course, slug } = await params;
    const fileSlug = slug.join('/');
    const logicalPath = `${course}/${fileSlug}`;

    try {
        // 1. Find file ID from catalog
        const catalog = await getJson("catalog.json") || [];
        const fileEntry = catalog.find(f => f.logicalPath === logicalPath);

        if (!fileEntry || !fileEntry.link) {
            return new Response("File Not Found", { status: 404 });
        }

        const fileId = fileEntry.link;

        // 2. Get stream from Google Drive
        const drive = await getDriveClient();
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        return new Response(response.data, {
            headers: {
                'Content-Type': fileEntry.mimeType || 'application/pdf',
                'Content-Disposition': `inline; filename="${fileEntry.fileName || 'document.pdf'}"`
            }
        });

    } catch (error) {
        console.error("File serve error:", error);
        return new Response("Server Error: " + error.message, { status: 500 });
    }
}
