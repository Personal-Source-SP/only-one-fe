import { google, drive_v3 } from 'googleapis';

export const getDriveClient = (accessToken?: string): drive_v3.Drive => {
    const oauth2Client = new google.auth.OAuth2();

    if (accessToken) {
        oauth2Client.setCredentials({ access_token: accessToken });
    }

    return google.drive({ version: 'v3', auth: oauth2Client });
};

export const extractBearerToken = (request: Request): string | undefined => {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!auth) return undefined;

    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];

    return undefined;
};
