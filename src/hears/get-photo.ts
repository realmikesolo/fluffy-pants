import axios from 'axios';
import { google } from 'googleapis';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Context } from 'telegraf';

export class PhotoListener {
  public async execute(ctx: Context): Promise<void> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL,
    );

    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
    });

    const phId = (ctx.update as any).message.photo.at(-1).file_id;
    const url = await ctx.telegram.getFileLink(phId);
    const fullMimeType = url.href.split('.').at(-1);

    const response = await axios({ url: url.href, responseType: 'stream' });

    await writeFile(resolve(__dirname, `../../data/cat.${fullMimeType}`), response.data);

    await drive.files.create({
      requestBody: {
        name: `cat.${fullMimeType}`,
        mimeType: `image/${fullMimeType}`,
        parents: [`${process.env.GOOGLE_FOLDER_ID}`],
      },
      media: {
        mimeType: `image/${fullMimeType}`,
        body: fs.createReadStream(resolve(__dirname, `../../data/cat.${fullMimeType}`)),
      },
    });

    await drive.permissions.create({
      fileId: process.env.GOOGLE_FOLDER_ID,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  }
}
