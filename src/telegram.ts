import { Telegraf } from 'telegraf';
import { StartCommand } from './commands/start';
import { PhotoListener } from './hears/get-photo';
import { VideoListener } from './hears/get-video';
import { SendMediaHear } from './hears/send-media';

export class TelegramBot {
  private readonly bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_TOKEN!);
  }

  public async run(): Promise<void> {
    await this.bot.launch();
  }

  public stop(): void {
    this.bot.stop();
  }

  public async load(): Promise<void> {
    const commands = [new StartCommand()];
    const hears = [new SendMediaHear()];
    const photoListener = new PhotoListener();
    const videoListener = new VideoListener();

    this.bot.on('photo', (ctx) => photoListener.execute(ctx));
    this.bot.on('video', (ctx) => videoListener.execute(ctx));

    commands.forEach((command) => this.bot.command(command.name, (ctx) => command.execute(ctx)));
    hears.forEach((hear) => this.bot.hears(hear.name, (ctx) => hear.execute(ctx)));
  }
}
