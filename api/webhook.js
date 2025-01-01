const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');
const process = require('process');

// Получаем токен из переменных окружения
const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

// Обработчик команды /start
const start = async (ctx) => {
  await ctx.reply(
    'Привет! Напиши /time, чтобы узнать, сколько дней, минут и секунд осталось до Нового года.\n' +
    'Hello! Type /time to find out how many days, minutes, and seconds are left until New Year.'
  );
};

// Обработчик команды /time
const timeToNewYear = async (ctx) => {
  const now = DateTime.local();
  const newYear = DateTime.local().plus({ years: 1 }).startOf('year');
  const timeLeft = newYear.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

  const { days, hours, minutes, seconds } = timeLeft;

  await ctx.reply(
    `До Нового года осталось ${days} дней, ${hours} часов, ${minutes} минут и ${seconds} секунд!\n` +
    `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds left until New Year!`
  );
};

// Обработчики команд
bot.command('start', start);
bot.command('time', timeToNewYear);

// Это будет файл, который Vercel будет использовать для обработки запросов на webhook.
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Обработка входящего запроса
      await bot.handleUpdate(req.body, res);
      return res.status(200).json({ status: 'ok' });
    } catch (e) {
      console.error('Error processing update:', e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    console.log('Method not allowed: ', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};
