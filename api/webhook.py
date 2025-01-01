from telegram import Update
from telegram.ext import Application
import os
import json

# Получение токена бота из переменных окружения
TOKEN = os.getenv("BOT_TOKEN")

# Создание приложения Telegram
app = Application.builder().token(TOKEN).build()

async def handler(request):
    try:
        # Проверка метода запроса
        if request.method != "POST":
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method Not Allowed"})
            }

        # Получение данных запроса
        json_data = await request.json()
        update = Update.de_json(json_data, app.bot)

        # Обработка обновления
        await app.process_update(update)
        return {
            "statusCode": 200,
            "body": json.dumps({"status": "ok"})
        }
    except Exception as e:
        # Обработка ошибок
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
