const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon'); // Для удобной работы с датами
const process = require('process');
const pTimeout = require('p-timeout'); // Подключаем p-timeout

const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

// Функция отправки сообщений с увеличенным тайм-аутом
const sendMessage = async (ctx, message) => {
  try {
    console.log('Sending message:', message);  // Логирование отправляемого сообщения
    // Используем p-timeout для тайм-аута в 90 секунд
    await pTimeout(ctx.reply(message), 90000, 'Sending message timed out');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const start = async (ctx) => {
  await sendMessage(
    ctx, 
    'Привет! Напиши /time, чтобы узнать, сколько дней, минут и секунд осталось до Нового года.\n' +
    'Hello! Type /time to find out how many days, minutes, and seconds are left until New Year.'
  );
};

const timeToNewYear = async (ctx) => {
  const now = DateTime.local();
  const newYear = DateTime.local().plus({ years: 1 }).startOf('year');
  const timeLeft = newYear.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

  const { days, hours, minutes, seconds } = timeLeft;

  await sendMessage(
    ctx, 
    `До Нового года осталось ${days} дней, ${hours} часов, ${minutes} минут и ${seconds} секунд!\n` +
    `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds left until New Year!`
  );
};

// Обработчики команд
bot.command('start', start);
bot.command('time', timeToNewYear);

// Сервер для работы с вебхуками Vercel
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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};
