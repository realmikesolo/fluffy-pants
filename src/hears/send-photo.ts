import { google } from 'googleapis';
import { Context } from 'telegraf';

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

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

let cache: any[] = [];
let cacheExpiresAt = 0;

export class SendPhotoHear {
  public name = 'Получить фотку';

  public async execute(ctx: Context): Promise<void> {
    const files =
      Date.now() > cacheExpiresAt
        ? await drive.files
            .list({
              q: `'${process.env.GOOGLE_FOLDER_ID}' in parents`,
              fields: 'nextPageToken, files(id, name)',
              spaces: 'drive',
            })
            .then((res) => {
              cacheExpiresAt = Date.now() + 5 * 60 * 1000;
              cache = res.data.files!;
              return cache;
            })
        : cache;

    const max = files!.length - 1;

    const image = await drive.files
      .get(
        {
          fileId: files[getRandomInt(max)].id!,
          alt: 'media',
        },
        { responseType: 'stream' },
      )
      .then(
        ({ data }) =>
          new Promise<Buffer>((resolve) => {
            const buf: Buffer[] = [];
            data.on('data', (e) => buf.push(e));
            data.on('end', () => resolve(Buffer.concat(buf)));
          }),
      );

    ctx.replyWithPhoto({ source: image });
  }
}
