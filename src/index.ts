import 'dotenv/config';
import { TelegramBot } from './telegram';

const telegram = new TelegramBot();

(async (): Promise<void> => {
  await telegram.run();
  console.log('Telegram started');

  await telegram.load();
  console.log('Commands loaded');
  console.log('Bot ready for use');
})();
