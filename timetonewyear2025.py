import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from datetime import datetime
import os

# Функция для обработки команды /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        'Привет! Напиши /time, чтобы узнать, сколько дней, минут и секунд осталось до Нового года.\n'
        'Hello! Type /time to find out how many days, minutes, and seconds are left until New Year.'
    )

# Функция для обработки команды /time
async def time_to_new_year(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    now = datetime.now()
    new_year = datetime(now.year + 1, 1, 1)  # January 1st of the next year
    time_left = new_year - now

    days = time_left.days
    seconds = time_left.seconds
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    await update.message.reply_text(
        f'До Нового года осталось {days} дней, {hours} часов, {minutes} минут и {seconds} секунд!\n'
        f'{days} days, {hours} hours, {minutes} minutes, and {seconds} seconds left until New Year!'
    )

# Основная логика бота
async def main():
    TOKEN = os.getenv("BOT_TOKEN")  # Получаем токен из переменной окружения
    app = Application.builder().token(TOKEN).build()

    # Добавление обработчиков команд
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("time", time_to_new_year))

    # Установка вебхука с вашим URL
    webhook_url = "https://tgbot-timetonewyear.onrender.com"  # Ваш URL для вебхука
    await app.bot.set_webhook(webhook_url)

    # Получаем порт из переменной окружения
    port = int(os.getenv("PORT", 8443))  # Если переменная окружения PORT не найдена, используем 8443

    # Запуск бота с вебхуком
    await app.run_webhook(
        listen="0.0.0.0",  # Слушаем все IP-адреса
        port=port,  # Указываем порт
        webhook_url=webhook_url
    )

# Запуск основного процесса с правильным использованием event loop
if __name__ == '__main__':
    loop = asyncio.get_event_loop()  # Get the running event loop
    loop.create_task(main())  # Create a task for the main coroutine
    loop.run_forever()  # Keep the loop running indefinitely
