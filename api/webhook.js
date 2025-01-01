const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon'); // Для удобной работы с датами
const process = require('process');

// Получаем токен из переменных окружения
const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

let interval = null;  // Переменная для хранения интервала в минутах
let sendTask = null;  // Переменная для хранения задачи отправки сообщений
let timezoneOffset = 2;  // Смещение часового пояса (по умолчанию 0)

// Функция для вычисления оставшегося времени до Нового года
const calculateTimeToNewYear = () => {
  const now = DateTime.local().setZone('UTC').plus({ hours: timezoneOffset });  // Учитываем таймзону
  const newYear = DateTime.local().plus({ years: 1 }).startOf('year');  // Новый год 2026
  const remainingTime = newYear.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

  return remainingTime;
};

// Функция для команды /start
const startCommand = async (ctx) => {
  await ctx.reply(
    'Hello! 😎\nHow it works?\n\n"/timezone +2" - time zone offset (for example, +2 hours)\n"/timezone -3" - time zone offset (for example, -3 hours)\n\n/time - find out how many days, hours and minutes are left until the New Year.\n\n"/interval 1440" - interval in minutes for automatic sending of messages about the time until the New Year. For 1440 minutes = a day)\nTo turn off the interval, enter "/interval -"'
  );
};

// Функция для команды /time
const timeCommand = async (ctx) => {
  const { days, hours, minutes, seconds } = calculateTimeToNewYear();
  await ctx.reply(
    `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds left until New Year!\nTimezone: ${timezoneOffset}\n🥳🥳🥳`
  );
};

// Функция для команды /interval
const intervalCommand = async (ctx) => {
  if (!ctx.message.text.split(' ')[1]) {
    return await ctx.reply(
      'Enter the interval in minutes or hours to send messages about the time until New Year.\nInterval format: number (e.g. "/interval 1" for 1 minute).\nTo disable the interval, enter "/interval -"'
    );
  }

  if (ctx.message.text.split(' ')[1] === '-') {
    interval = null;
    if (sendTask) {
      sendTask.cancel();
    }
    sendTask = null;
    return await ctx.reply('Interval disabled 😢');
  }

  const userInput = parseInt(ctx.message.text.split(' ')[1]);
  if (isNaN(userInput) || userInput <= 0) {
    return await ctx.reply(
      'Error! Invalid interval format.\nInterval format: number (e.g. "/interval 1" for 1 minute).\nTo disable the interval, enter "/interval -"'
    );
  }

  interval = userInput;

  await ctx.reply(`Interval set to ${interval} minutes 😍`);

  const sendMessage = async () => {
    while (interval) {
      await new Promise((resolve) => setTimeout(resolve, interval * 60 * 1000));
      const { days, hours, minutes, seconds } = calculateTimeToNewYear();
      try {
        await ctx.reply(
          `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds left until New Year!\nTimezone: ${timezoneOffset}\n🥳🥳🥳\n\nThis is an automatic message! To disable, enter "/interval -" `
        );
      } catch (e) {
        console.error('Error sending message: ', e);
      }
    }
  };

  if (sendTask) {
    sendTask.cancel();
  }

  sendTask = setInterval(sendMessage, interval * 60 * 1000);
};

// Функция для команды /timezone
const timezoneCommand = async (ctx) => {
  if (!ctx.message.text.split(' ')[1]) {
    return await ctx.reply('Enter the time zone offset (e.g. "/timezone +2" or "/timezone -3").');
  }

  const offset = parseInt(ctx.message.text.split(' ')[1]);
  if (isNaN(offset)) {
    return await ctx.reply('Error! Please enter a valid number (e.g. "/timezone +2" or "/timezone -3").');
  }

  timezoneOffset = offset;
  await ctx.reply(`Time zone set to: UTC ${timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset} 🫡`);
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
