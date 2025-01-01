const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');
const express = require('express');
const process = require('process');

// Получаем токен из переменных окружения
const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

// Часовой пояс для вашего региона
const timezoneOffset = 2; // UTC +2, например

// Настройка Express сервера
const app = express();
app.use(express.json());

// Функция для команды /start
const start = async (ctx) => {
  await ctx.reply(
    'Привет! Напиши /time, чтобы узнать, сколько дней, минут и секунд осталось до Нового года.\n' +
    'Hello! Type /time to find out how many days, minutes, and seconds are left until New Year.'
  );
};

// Функция для команды /time
const timeToNewYear = async (ctx) => {
  const now = DateTime.utc().plus({ hours: timezoneOffset });  // Учитываем смещение часового пояса
  const newYear = DateTime.utc().plus({ years: 1 }).startOf('year');  // Новый год в UTC
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

bot.telegram.setWebhook(`https://your-app-name.onrender.com/api/webhook`);

// Сервер для работы с вебхуками
app.post('/api/webhook', async (req, res) => {
  try {
    // Обработка входящего запроса
    await bot.handleUpdate(req.body);
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    console.error('Error processing update:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Запуск сервера на Render
const port = process.env.PORT || 3000;  // Порт для Render
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
