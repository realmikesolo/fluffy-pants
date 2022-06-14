import { Telegraf } from 'telegraf';
import { StartCommand } from './commands/start';
import { PhotoListener } from './hears/get-photo';
import { SendPhotoHear } from './hears/send-photo';

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
    const hears = [new SendPhotoHear()];
    const photoListener = new PhotoListener();

    this.bot.on('photo', (ctx) => photoListener.execute(ctx));

    commands.forEach((command) => this.bot.command(command.name, (ctx) => command.execute(ctx)));
    hears.forEach((hear) => this.bot.hears(hear.name, (ctx) => hear.execute(ctx)));
  }
}
