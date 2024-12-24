import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
from datetime import datetime
import os

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        'Привет! Напиши /time, чтобы узнать, сколько дней, минут и секунд осталось до Нового года.\n'
        'Hello! Type /time to find out how many days, minutes, and seconds are left until New Year.'
    )

async def time_to_new_year(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    now = datetime.now()
    new_year = datetime(now.year + 1, 1, 1)
    time_left = new_year - now

    days = time_left.days
    seconds = time_left.seconds
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    await update.message.reply_text(
        f'До Нового года осталось {days} дней, {hours} часов, {minutes} минут и {seconds} секунд!\n'
        f'{days} days, {hours} hours, {minutes} minutes, and {seconds} seconds left until New Year!'
    )

async def main():
    TOKEN = os.getenv("BOT_TOKEN")
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("time", time_to_new_year))

    # Заменяем URL на ваш собственный
    webhook_url = "https://tgbot-timetonewyear.onrender.com/"
    print(f"Setting webhook to: {webhook_url}")  # Выводим URL для отладки

    try:
        await app.bot.set_webhook(webhook_url)
    except Exception as e:
        print(f"Error setting webhook: {e}")

    # Используем порт, предоставленный Render
    port = int(os.getenv("PORT", 8443))  # Default to 8443 if not set

    await app.run_webhook(
        listen="0.0.0.0",
        port=port,
        webhook_url=webhook_url
    )

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.create_task(main())
    loop.run_forever()
