const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon'); // Для удобной работы с датами
const process = require('process');

const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

let interval = null;  // Переменная для интервала
let sendTask = null;  // Переменная для задачи автоматической отправки сообщений
let isSendingMessage = false; // Флаг для предотвращения отправки нескольких сообщений одновременно
let timezoneOffset = 2; // По умолчанию смещение по времени (UTC +2)

const calculateTimeToNewYear = async () => {
  const now = DateTime.local().plus({ hours: timezoneOffset });
  const newYear = DateTime.local().plus({ years: 1 }).startOf('year');
  const timeLeft = newYear.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

  const { days, hours, minutes, seconds } = timeLeft;
  return { days, hours, minutes, seconds };
};

const sendMessage = async (ctx, message) => {
  if (isSendingMessage) return;  // Если уже отправляется сообщение, не отправлять другое

  isSendingMessage = true;
  try {
    await ctx.reply(message);
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    isSendingMessage = false;
  }
};

const startCommand = async (ctx) => {
  await sendMessage(ctx,
    'Привет! Напиши /time, чтобы узнать, сколько дней, минут и секунд осталось до Нового года.\n' +
    'Hello! Type /time to find out how many days, minutes, and seconds are left until New Year.\n\n' +
    '/timezone <offset> - set time zone (e.g. /timezone +2 for UTC+2)\n' +
    '/interval <minutes> - set interval for automatic updates (e.g. /interval 1 for 1 minute)');
};

const timeCommand = async (ctx) => {
  const { days, hours, minutes, seconds } = await calculateTimeToNewYear();
  await sendMessage(ctx,
    `${days} дней, ${hours} часов, ${minutes} минут и ${seconds} секунд до Нового года! 🥳\n` +
    `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds left until New Year! 🎉`);
};

const intervalCommand = async (ctx) => {
  const userInput = ctx.message.text.split(' ')[1];

  if (!userInput) {
    await sendMessage(ctx, 
      'Введите интервал в минутах или часах для автоматических сообщений о времени до Нового года.\n' +
      'Формат интервала: число (например, "/interval 1" для 1 минуты).\n' +
      'Чтобы отключить интервал, введите "/interval -".');
    return;
  }

  if (userInput === '-') {
    if (sendTask) {
      clearInterval(sendTask);
      sendTask = null;
    }
    interval = null;
    await sendMessage(ctx, 'Интервал отключен 😢');
    return;
  }

  const intervalInMinutes = parseInt(userInput);
  
  if (isNaN(intervalInMinutes) || intervalInMinutes <= 0) {
    await sendMessage(ctx, 
      'Ошибка! Неверный формат интервала. Введите положительное число.\n' +
      'Формат интервала: число (например, "/interval 1" для 1 минуты).\n' +
      'Чтобы отключить интервал, введите "/interval -".');
    return;
  }

  interval = intervalInMinutes;
  await sendMessage(ctx, `Интервал установлен: каждые ${interval} минут(ы). 😍`);

  if (sendTask) {
    clearInterval(sendTask);
    sendTask = null;
  }

  sendTask = setInterval(async () => {
    const { days, hours, minutes, seconds } = await calculateTimeToNewYear();
    await sendMessage(ctx,
      `${days} дней, ${hours} часов, ${minutes} минут и ${seconds} секунд до Нового года! 🥳\n` +
      `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds left until New Year! 🎉\n\n` +
      'Это автоматическое сообщение! Чтобы отключить, введите "/interval -".');
  }, interval * 60 * 1000);
};

const timezoneCommand = async (ctx) => {
  const userInput = ctx.message.text.split(' ')[1];

  if (!userInput) {
    await sendMessage(ctx, 
      'Введите смещение часового пояса (например, "/timezone +2" или "/timezone -3").');
    return;
  }

  const offset = parseInt(userInput);

  if (isNaN(offset)) {
    await sendMessage(ctx, 'Ошибка! Введите корректное число для смещения (например, "/timezone +2" или "/timezone -3").');
    return;
  }

  timezoneOffset = offset;
  await sendMessage(ctx, `Часовой пояс установлен на: UTC ${timezoneOffset >= 0 ? '+' + timezoneOffset : timezoneOffset} 🫡`);
};

bot.command('start', startCommand);
bot.command('time', timeCommand);
bot.command('interval', intervalCommand);
bot.command('timezone', timezoneCommand);

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
