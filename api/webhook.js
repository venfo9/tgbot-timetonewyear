const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');
const process = require('process');

// Получаем токен из переменных окружения
const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

let interval = null;  // Переменная для интервала (в минутах)
let sendTask = null;  // Переменная для задачи отправки сообщений
let isSendingMessage = false;  // Флаг для предотвращения повторной отправки сообщения

const timezoneOffset = 2;  // Смещение часового пояса (по умолчанию 0)

const calculateTimeToNewYear = async () => {
  const now = DateTime.local().setZone('UTC').plus({ hours: timezoneOffset });
  const newYear = DateTime.local().plus({ years: 1 }).startOf('year');
  const timeLeft = newYear.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

  const { days, hours, minutes, seconds } = timeLeft;

  return { days, hours, minutes, seconds };
};

// Функция отправки сообщения
const sendMessage = async (ctx, message) => {
  if (isSendingMessage) return;  // Защита от отправки нескольких сообщений одновременно

  isSendingMessage = true;
  try {
    console.log('Sending message:', message);  // Логирование отправляемого сообщения
    await ctx.reply(message);
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    isSendingMessage = false;
  }
};

// Команда /start
const startCommand = async (ctx) => {
  console.log(`User ${ctx.from.username} used /start`);
  await sendMessage(ctx, 
    'Hello! 😎\nHow it works?\n\n"/timezone +2" - time zone offset (for example, +2 hours)\n"/timezone -3" - time zone offset (for example, -3 hours)\n\n/time - find out how many days, hours and minutes are left until the New Year.\n\n"/interval 1440" - interval in minutes for automatic sending of messages about the time until the New Year. For 1440 minutes = a day)\nTo turn off the interval, enter "/interval -"'
  );
};

// Команда /time
const timeCommand = async (ctx) => {
  console.log(`User ${ctx.from.username} used /time`);
  const { days, hours, minutes, seconds } = await calculateTimeToNewYear();
  await sendMessage(ctx, 
    `${days} days, ${hours} hours, and ${minutes} minutes left until New Year! 🎉\nTimezone: ${timezoneOffset}`
  );
};

// Команда /interval для установки интервала
const intervalCommand = async (ctx) => {
  const userInput = ctx.message.text.split(' ')[1];

  if (!userInput) {
    await sendMessage(ctx, 
      'Enter the interval in minutes or hours to send messages about the time until New Year.\n' +
      'Interval format: number (e.g. "/interval 1" for 1 minute).\n' +
      'To disable the interval, enter "/interval -".');
    return;
  }

  if (userInput === '-') {
    if (sendTask) {
      clearInterval(sendTask);
      sendTask = null;
    }
    interval = null;
    await sendMessage(ctx, 'Interval disabled!');
    return;
  }

  const intervalInMinutes = parseInt(userInput);

  if (isNaN(intervalInMinutes) || intervalInMinutes <= 0) {
    await sendMessage(ctx, 
      'Error! Please enter a valid number for the interval.\n' +
      'Interval format: number (e.g. "/interval 1" for 1 minute).\n' +
      'To disable the interval, enter "/interval -".');
    return;
  }

  interval = intervalInMinutes;
  await sendMessage(ctx, `Interval set to ${interval} minute(s).`);

  if (sendTask) {
    clearInterval(sendTask);
  }

  // Отправка сообщений через установленный интервал
  sendTask = setInterval(async () => {
    console.log(`Sending automated message every ${interval} minutes...`);
    const { days, hours, minutes, seconds } = await calculateTimeToNewYear();
    await sendMessage(ctx,
      `${days} days, ${hours} hours, and ${minutes} minutes left until New Year! 🎉\nTimezone: ${timezoneOffset}`
    );
  }, interval * 60000);  // Переводим минуты в миллисекунды
};

// Команда /timezone для установки часового пояса
const timezoneCommand = async (ctx) => {
  const userInput = ctx.message.text.split(' ')[1];

  if (!userInput) {
    await sendMessage(ctx, 'Enter the time zone offset (e.g. "/timezone +2" or "/timezone -3").');
    return;
  }

  const offset = parseInt(userInput);

  if (isNaN(offset)) {
    await sendMessage(ctx, 'Error! Please enter a valid number (e.g. "/timezone +2" or "/timezone -3").');
    return;
  }

  timezoneOffset = offset;
  await sendMessage(ctx, `Time zone set to: UTC ${timezoneOffset}`);
};

// Обработчики команд
bot.command('start', startCommand);
bot.command('time', timeCommand);
bot.command('interval', intervalCommand);
bot.command('timezone', timezoneCommand);

// Сервер для работы с вебхуками Vercel
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
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

bot.launch();
