import axios from 'axios';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Context } from 'telegraf';
import { drive } from '../google';

export class PhotoListener {
  public async execute(ctx: Context): Promise<void> {
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
