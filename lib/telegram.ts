import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

export const bot = new TelegramBot(token, { polling: false });

export const sendMessage = async (chatId: number, text: string, options?: any) => {
  return bot.sendMessage(chatId, text, options);
};


