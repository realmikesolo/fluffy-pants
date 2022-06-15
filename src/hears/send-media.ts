import { Context } from 'telegraf';
import { drive } from '../google';

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

let cache: any[] = [];
let cacheExpiresAt = 0;

export class SendMediaHear {
  public name = 'Выпечка';

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
    const file = files[getRandomInt(max)];

    const media = await drive.files
      .get(
        {
          fileId: file.id!,
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

    if (file.name.split('.')[1] === 'mp4') {
      ctx.replyWithVideo({ source: media });
    } else {
      ctx.replyWithPhoto({ source: media });
    }
  }
}
