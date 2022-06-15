import { Context, Markup } from 'telegraf';
import { Entity } from '../entity';

export class StartCommand extends Entity {
  public name = 'start';

  public async execute(ctx: Context): Promise<void> {
    await ctx.reply('Пришло время смотреть на пушистых', Markup.keyboard([['Выпечка']]).resize());
  }
}
