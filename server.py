import aiohttp
from aiohttp import web
import logging
import pathlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get current directory
BASE_DIR = pathlib.Path(__file__).parent

# Setup routes
async def index(request):
    """Serve the main HTML page"""
    try:
        with open(BASE_DIR / "templates" / "index.html") as f:
            return web.Response(text=f.read(), content_type='text/html')
    except Exception as e:
        logger.error(f"Error serving index page: {e}")
        return web.Response(text="Error loading page", status=500)

# Create application
app = web.Application()

# Add routes
app.router.add_get('/', index)
app.router.add_static('/static', BASE_DIR / 'static')

if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=8000)
