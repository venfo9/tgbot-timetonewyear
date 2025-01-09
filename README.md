# Time to New Year Bot 🎉  

A Telegram bot that calculates and provides updates on the time remaining until the New Year!  
Built with [Telegraf](https://telegraf.js.org/) and hosted on [Render](https://render.com/).  

---

## Features ✨  
- **Set Timezone:** Adjust the bot to your timezone (e.g., `/timezone +2`).  
- **Check Time Left:** Get the exact days, hours, and minutes left until the New Year with `/time`.  
- **Interval Messages:** Enable automated interval messages (e.g., `/interval 60` for updates every 60 minutes).  
- **Customizable:** Disable intervals easily with `/interval -`.  

---

## How to Use 🚀  

### Start the Bot  
Send the `/start` command to get a quick introduction to the bot and its features.  

### Commands  
| Command        | Description                                         | Example          |  
|----------------|-----------------------------------------------------|------------------|  
| `/start`       | Start the bot and see the introduction message.     | `/start`         |  
| `/time`        | Get the time remaining until New Year.              | `/time`          |  
| `/timezone`    | Set your timezone offset.                          | `/timezone +2`   |  
| `/interval`    | Set or disable the interval for updates.            | `/interval 30`   |  

---

## Setup Instructions 🛠️  

### Prerequisites  
1. [Node.js](https://nodejs.org/) (v16+ recommended)  
2. A Telegram bot token from [BotFather](https://core.telegram.org/bots#botfather).  

### Installation  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/YOUR_USERNAME/tgbot-timetonewyear.git  
   cd tgbot-timetonewyear  

2. Install dependencies:
    ```bash
     npm install  

3. Create a .env file in the project root and add your bot token:
    ```bash
    BOT_TOKEN=your-telegram-bot-token 

4. Deploy the bot on Render (or any hosting platform) and set up the webhook:
Update the webhook URL in the code to match your deployment URL.
Example:
    ```bash
    bot.telegram.setWebhook('https://your-app-url.onrender.com/api/webhook');

### Dependencies

[Telegraf](https://telegraf.js.org/) - Telegram Bot Framework.

[Luxon](https://moment.github.io/luxon/api-docs/index.html) - For time calculations.

[Express](https://expressjs.com/) - Web framework for handling webhooks.

