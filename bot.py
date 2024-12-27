import os
import logging
from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get bot token from environment
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button that opens the webapp."""
    await update.message.reply_text(
        "Hello! Click the button below to open the mini app:",
        reply_markup={
            "inline_keyboard": [[{
                "text": "Open Mini App",
                "web_app": {"url": "https://105cb7fc-dfd7-4727-b684-658acb2195f0-00-1zzub4l927lil.worf.replit.dev"}
            }]]
        }
    )

def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(BOT_TOKEN).build()

    # Add command handlers
    application.add_handler(CommandHandler("start", start))

    # Start the Bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
