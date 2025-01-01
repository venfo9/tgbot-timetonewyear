from telegram import Update
from telegram.ext import Application
import os
import json

# Получение токена из переменных окружения
TOKEN = os.getenv("BOT_TOKEN")
app = Application.builder().token(TOKEN).build()

async def process_update(request):
    """Обработка входящего запроса от Telegram."""
    try:
        if request.method == "POST":
            # Чтение JSON-данных из запроса
            body = await request.body()
            json_data = json.loads(body)

            # Десериализация обновления Telegram
            update = Update.de_json(json_data, app.bot)

            # Обработка обновления
            await app.process_update(update)
            return {
                "statusCode": 200,
                "body": json.dumps({"status": "ok"})
            }
        else:
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method Not Allowed"})
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

# Это важно: определение обработчика для Vercel
handler = process_update
