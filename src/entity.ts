import { Context } from 'telegraf';

export abstract class Entity {
  public name: string;

  public abstract execute(ctx: Context): Promise<void>;
}
