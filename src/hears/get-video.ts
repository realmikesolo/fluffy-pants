import axios from 'axios';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Context } from 'telegraf';
import { drive } from '../google';
import fs from 'node:fs';

export class VideoListener {
  public async execute(ctx: Context): Promise<void> {
    const message = (ctx.update as any).message;
    const videoId = message.video.file_id;
    const fullMimeType = message.video.mime_type;

    const url = await ctx.telegram.getFileLink(videoId);

    const response = await axios({ url: url.href, responseType: 'stream' });

    await writeFile(
      resolve(__dirname, `../../data/cat.${fullMimeType.replace('video/', '')}`),
      response.data,
    );

    await drive.files.create({
      requestBody: {
        name: `cat.${fullMimeType.replace('video/', '')}`,
        mimeType: `${message.video.mime_type}`,
        parents: [`${process.env.GOOGLE_FOLDER_ID}`],
      },
      media: {
        mimeType: `${message.video.mime_type}`,
        body: fs.createReadStream(resolve(__dirname, `../../data/cat.${fullMimeType.replace('video/', '')}`)),
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
