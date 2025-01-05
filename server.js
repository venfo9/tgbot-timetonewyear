const { Telegraf } = require('telegraf');
const { DateTime } = require('luxon');
const express = require('express');
const process = require('process');

const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

let interval = null; // Interval in minutes
let intervalTask = null; // Interval task reference
let timezoneOffset = 2; // Default timezone offset in hours

const app = express();
app.use(express.json());

// Calculate time to New Year
const calculateTimeToNewYear = () => {
  const now = DateTime.utc().plus({ hours: timezoneOffset }); // Текущее время с учетом таймзоны
  const currentYear = now.year;
  const newYear = DateTime.utc().set({ year: currentYear + 1, month: 1, day: 1, hour: 0, minute: 0, second: 0 }); // Полночь Нового года
  const diff = newYear.diff(now, ['days', 'hours', 'minutes', 'seconds']).toObject();

  const remainingDays = Math.floor(diff.days);
  const remainingHours = Math.floor(diff.hours % 24); // Остаток часов до конца дня
  const remainingMinutes = Math.floor(diff.minutes % 60); // Остаток минут до конца часа
  const remainingSeconds = Math.floor(diff.seconds % 60); // Остаток секунд до конца минуты

  return {
    days: remainingDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  };
};



// Command: /start
bot.command('start', async (ctx) => {
  await ctx.reply(
    'Hello! 😎\nHow it works?\n\n' +
    '"/timezone +2" - Set timezone offset (e.g., +2 hours).\n' +
    '"/timezone -3" - Set timezone offset (e.g., -3 hours).\n\n' +
    '"/time" - Find out how many days, hours, and minutes are left until the New Year.\n\n' +
    '"/interval 1440" - Set interval in minutes for automatic messages about the time left.\n' +
    '"/interval -" - Disable the interval.'
  );
});

// Command: /time
bot.command('time', async (ctx) => {
  const { days, hours, minutes } = calculateTimeToNewYear();
  await ctx.reply(
    `${days} days, ${hours} hours, and ${minutes} minutes left until New Year! 🥳\n` +
    `Timezone: UTC ${timezoneOffset > 0 ? '+' : ''}${timezoneOffset}`
  );
});

// Command: /interval
bot.command('interval', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);

  if (!args.length) {
    await ctx.reply('Provide an interval in minutes (e.g., "/interval 1" for 1 minute).\nTo disable, enter "/interval -".');
    return;
  }

  const value = args[0];
  if (value === '-') {
    if (intervalTask) clearInterval(intervalTask);
    interval = null;
    intervalTask = null;
    await ctx.reply('Interval disabled 😢');
    return;
  }

  const parsedInterval = parseInt(value, 10);
  if (isNaN(parsedInterval) || parsedInterval <= 0) {
    await ctx.reply('Invalid interval. Please enter a positive number (e.g., "/interval 1").');
    return;
  }

  interval = parsedInterval;

  if (intervalTask) clearInterval(intervalTask);
  intervalTask = setInterval(async () => {
    const { days, hours, minutes } = calculateTimeToNewYear();
    try {
      await ctx.reply(
        `${days} days, ${hours} hours, and ${minutes} minutes left until New Year! 🥳\n` +
        `This is an automatic message! To disable, enter "/interval -".`
      );
    } catch (error) {
      console.error('Error sending interval message:', error);
    }
  }, interval * 60 * 1000);

  await ctx.reply(`Interval set to ${interval} minutes! 😍`);
});

// Command: /timezone
bot.command('timezone', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);

  if (!args.length) {
    await ctx.reply('Enter the time zone offset (e.g., "/timezone +2" or "/timezone -3").');
    return;
  }

  const offset = parseInt(args[0], 10);
  if (isNaN(offset)) {
    await ctx.reply('Invalid timezone offset. Enter a valid number (e.g., "/timezone +2" or "/timezone -3").');
    return;
  }

  timezoneOffset = offset;
  await ctx.reply(`Timezone set to UTC ${timezoneOffset > 0 ? '+' : ''}${timezoneOffset} 🫡`);
});

// Set webhook
bot.telegram.setWebhook('https://tgbot-timetonewyear.onrender.com/api/webhook');

// Webhook route
app.post('/api/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send({ status: 'ok' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Start Express server
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
