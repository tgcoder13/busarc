import { put, del, list } from '@vercel/blob';

export async function uploadFile(fileName, buffer, mimeType) {
    const { url } = await put(fileName, buffer, {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: true // Default but safe
    });
    return url;
}

export async function deleteFile(url) {
    await del(url);
}

export async function setJson(fileName, data) {
    // We use a fixed name for the catalog/users to make it easy to find
    const { url } = await put(fileName, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false // We want to overwrite/update the same file identity
    });
    return url;
}

export async function getJson(fileName) {
    try {
        // Find the file by name first
        const { blobs } = await list({ prefix: fileName });
        const blob = blobs.find(b => b.pathname === fileName);

        if (!blob) return null;

        const response = await fetch(blob.url);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching JSON from Vercel Blob:", error.message);
        return null;
    }
}
