import { put, del, list } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob
 */
export async function uploadFile(fileName, buffer, mimeType) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log(`[Storage] Uploading: ${fileName}, Token present: ${!!token}`);
    try {
        if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is missing from environment");

        const { url } = await put(fileName, buffer, {
            access: 'public',
            contentType: mimeType,
            addRandomSuffix: true,
            token: token
        });
        console.log(`[Storage] Upload success: ${url}`);
        return url;
    } catch (error) {
        console.error(`[Storage] Upload error for ${fileName}:`, error.message);
        throw error;
    }
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteFile(url) {
    console.log(`[Storage] Deleting: ${url}`);
    try {
        await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch (error) {
        console.error(`[Storage] Delete error for ${url}:`, error.message);
    }
}

/**
 * Save JSON data to Vercel Blob
 */
export async function setJson(fileName, data) {
    console.log(`[Storage] Saving JSON: ${fileName}`);
    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const { url } = await put(fileName, JSON.stringify(data, null, 2), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
            token: token
        });
        console.log(`[Storage] JSON saved: ${url}`);
        return url;
    } catch (error) {
        console.error(`[Storage] Error saving JSON ${fileName}:`, error.message);
        throw error;
    }
}

/**
 * Retrieve JSON data from Vercel Blob
 */
export async function getJson(fileName) {
    console.log(`[Storage] Getting JSON: ${fileName}`);
    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
            console.warn("[Storage] BLOB_READ_WRITE_TOKEN is missing");
            return null;
        }

        const { blobs } = await list({ prefix: fileName, token: token });
        const blob = blobs.find(b => b.pathname === fileName);

        if (!blob) {
            console.log(`[Storage] No blob found with pathname: ${fileName}`);
            return null;
        }

        const response = await fetch(blob.url);
        if (!response.ok) {
            console.warn(`[Storage] Failed to fetch blob: ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`[Storage] Error in getJson for ${fileName}:`, error.message);
        return null;
    }
}
