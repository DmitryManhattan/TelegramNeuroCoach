import aiohttp
from aiohttp import web
import logging
import pathlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from models import SessionLocal, init_db, MoodEntry

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get current directory
BASE_DIR = pathlib.Path(__file__).parent

# Initialize database
init_db()

# Setup routes
async def index(request):
    """Serve the main HTML page"""
    try:
        with open(BASE_DIR / "templates" / "index.html") as f:
            return web.Response(text=f.read(), content_type='text/html')
    except Exception as e:
        logger.error(f"Error serving index page: {e}")
        return web.Response(text="Error loading page", status=500)

async def get_mood_data(request):
    """Get mood data for a specific date and user"""
    try:
        date_str = request.query.get('date')
        init_data = json.loads(request.query.get('initData', '{}'))
        user_data = json.loads(init_data.get('user', '{}'))
        user_id = user_data.get('id')

        if not date_str or not user_id:
            return web.json_response({"status": "error", "message": "Missing date or user ID"}, status=400)

        date = datetime.strptime(date_str, '%Y-%m-%d').date()

        db = SessionLocal()
        try:
            entry = db.query(MoodEntry).filter(
                MoodEntry.user_id == user_id,
                MoodEntry.date == date
            ).first()

            if entry:
                return web.json_response({
                    "status": "success",
                    "data": entry.to_dict()
                })
            else:
                return web.json_response({
                    "status": "success",
                    "data": None
                })
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error getting mood data: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)

async def webapp_data(request):
    """Handle data from Telegram WebApp"""
    try:
        request_data = await request.json()
        init_data = request_data.get('initData', '')
        data = request_data.get('data', {})

        # Parse user data from initData
        init_data_dict = dict(pair.split('=') for pair in init_data.split('&'))
        user_data = json.loads(init_data_dict.get('user', '{}'))
        user_id = user_data.get('id')

        if not user_id:
            return web.json_response({"status": "error", "message": "User ID not found"}, status=400)

        # Process the data
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()

        db = SessionLocal()
        try:
            # Check if entry exists
            entry = db.query(MoodEntry).filter(
                MoodEntry.user_id == user_id,
                MoodEntry.date == date
            ).first()

            if entry:
                # Update existing entry
                entry.mood = data['mood']
                entry.achievement = data['achievement']
                entry.goals = data['goals']
            else:
                # Create new entry
                entry = MoodEntry(
                    user_id=user_id,
                    date=date,
                    mood=data['mood'],
                    achievement=data['achievement'],
                    goals=data['goals']
                )
                db.add(entry)

            db.commit()
            logger.info(f"Saved mood entry for user {user_id} on {date}")
            return web.json_response({"status": "success", "message": "Data saved successfully"})

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error processing WebApp data: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)

# Create application
app = web.Application()

# Add routes
app.router.add_get('/', index)
app.router.add_get('/mood-data', get_mood_data)
app.router.add_post('/webapp-data', webapp_data)
app.router.add_static('/static', BASE_DIR / 'static')

if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=8000)