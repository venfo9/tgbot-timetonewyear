const { Telegraf } = require('telegraf');
const process = require('process');
const moment = require('moment-timezone');  // Для работы с временными зонами

const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);

let interval = null;  // Интервал для автоматических сообщений
let sendTask = null;  // Задача для отправки сообщений
let timezoneOffset = 2;  // Смещение по времени (по умолчанию 2)

const calculateTimeToNewYear = () => {
  const now = moment().utcOffset(timezoneOffset * 60); // Учитываем временную зону
  const newYear = moment('2026-01-01T00:00:00');  // Новый год 2026
  const remainingTime = newYear.diff(now);

  const duration = moment.duration(remainingTime);
  return {
    days: duration.days(),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };
};

const startCommand = async (ctx) => {
  console.log("Start command received.");
  await ctx.reply(
    'Hello! 😎\nHow it works?\n\n' +
    '"/timezone +2" - set your timezone (for example, +2 hours)\n' +
    '"/timezone -3" - set your timezone (for example, -3 hours)\n\n' +
    '/time - find out how many days, hours, and minutes are left until the New Year.\n' +
    '"/interval 1440" - set the interval in minutes to send messages automatically about the time left to New Year (for example, 1440 minutes = 1 day).\n' +
    'To turn off the interval, type "/interval -".'
  );
};

const timeCommand = async (ctx) => {
  console.log("Time command received.");
  const { days, hours, minutes, seconds } = calculateTimeToNewYear();
  await ctx.reply(
    `${days} days, ${hours} hours, and ${minutes} minutes\nTimezone: UTC ${timezoneOffset >= 0 ? '+' + timezoneOffset : timezoneOffset}\n\n🥳🥳🥳`
  );
};

const intervalCommand = async (ctx) => {
  console.log("Interval command received. Args:", ctx.message.text.split(' '));

  if (!ctx.message.text.split(' ')[1]) {
    console.log("No argument provided for interval.");
    return await ctx.reply(
      'Enter the interval in minutes or hours for automatic messages about the time until New Year.\n' +
      'Interval format: number (e.g. "/interval 1" for 1 minute).\n' +
      'To disable the interval, enter "/interval -".'
    );
  }

  const userInput = ctx.message.text.split(' ')[1];
  
  if (userInput === '-') {
    console.log("Disabling interval...");
    clearInterval(interval);
    interval = null;
    if (sendTask) {
      sendTask.stop();
      sendTask = null;
    }
    return await ctx.reply('Interval disabled 😢');
  }

  const intervalInMinutes = parseInt(userInput);
  
  if (isNaN(intervalInMinutes) || intervalInMinutes <= 0) {
    console.log("Invalid interval value:", userInput);
    return await ctx.reply(
      'Error! Invalid interval format. Please use a valid positive number.\n' +
      'Interval format: number (e.g. "/interval 1" for 1 minute).\n' +
      'To disable the interval, enter "/interval -".'
    );
  }

  interval = intervalInMinutes;
  await ctx.reply(`Interval set: every ${interval} minute(s). 😍`);

  // Если задача уже существует, останавливаем её перед установкой новой
  if (sendTask) {
    console.log("Clearing existing interval task...");
    clearInterval(sendTask);
    sendTask = null;
  }

  console.log("Starting interval task...");

  sendTask = setInterval(async () => {
    console.log("Interval reached, preparing to send message...");
    const { days, hours, minutes, seconds } = calculateTimeToNewYear();
    try {
      console.log("Sending message to user...");
      await ctx.reply(
        `${days} days, ${hours} hours, and ${minutes} minutes\nTimezone: UTC ${timezoneOffset >= 0 ? '+' + timezoneOffset : timezoneOffset}\n\n🥳🥳🥳\n\nThis is an automatic message! To stop, type "/interval -".`
      );
    } catch (error) {
      console.error('Error sending automatic message:', error);
    }
  }, interval * 60 * 1000); // Время в миллисекундах
};

const timezoneCommand = async (ctx) => {
  console.log("Timezone command received.");
  const newOffset = parseInt(ctx.message.text.split(' ')[1]);

  if (isNaN(newOffset)) {
    return await ctx.reply(
      'Error! Please enter a valid number (e.g., "/timezone +2" or "/timezone -3").'
    );
  }

  timezoneOffset = newOffset;
  await ctx.reply(`Time zone set to: UTC ${timezoneOffset >= 0 ? '+' + timezoneOffset : timezoneOffset} 🫡`);
};

bot.command('start', startCommand);
bot.command('time', timeCommand);
bot.command('interval', intervalCommand);
bot.command('timezone', timezoneCommand);

bot.launch();
