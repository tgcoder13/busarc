import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

export async function getDriveClient() {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        null,
        process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        SCOPES
    );
    return google.drive({ version: 'v3', auth });
}

export async function uploadFile(fileName, mimeType, buffer, metadata = {}) {
    const drive = await getDriveClient();

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const response = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [FOLDER_ID],
            mimeType: mimeType,
            appProperties: metadata // Store extra info here
        },
        media: {
            mimeType: mimeType,
            body: stream,
        },
        fields: 'id, name, webViewLink'
    });

    return response.data;
}

export async function getFile(fileId) {
    const drive = await getDriveClient();
    const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, appProperties, webViewLink, webContentLink'
    });
    return response.data;
}

export async function findFileByName(fileName) {
    const drive = await getDriveClient();
    const response = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and name = '${fileName}' and trashed = false`,
        fields: 'files(id, name, mimeType, appProperties)',
        spaces: 'drive',
    });
    return response.data.files[0];
}

export async function getJson(fileName) {
    const file = await findFileByName(fileName);
    if (!file) return null;

    const drive = await getDriveClient();
    const response = await drive.files.get({
        fileId: file.id,
        alt: 'media'
    });
    return response.data;
}

export async function setJson(fileName, data) {
    const drive = await getDriveClient();
    const existingFile = await findFileByName(fileName);

    const media = {
        mimeType: 'application/json',
        body: JSON.stringify(data, null, 2),
    };

    if (existingFile) {
        await drive.files.update({
            fileId: existingFile.id,
            media: media,
        });
        return existingFile.id;
    } else {
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [FOLDER_ID],
                mimeType: 'application/json',
            },
            media: media,
            fields: 'id'
        });
        return response.data.id;
    }
}

export async function deleteFile(fileId) {
    const drive = await getDriveClient();
    await drive.files.delete({ fileId });
}
