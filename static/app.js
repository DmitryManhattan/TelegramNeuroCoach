// Initialize Telegram WebApp
const webapp = window.Telegram.WebApp;

// Expand to viewport
webapp.expand();

// Ready event
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the WebApp
    webapp.ready();
    
    // Set the header color to match Telegram theme
    document.body.style.backgroundColor = webapp.backgroundColor;
    
    // Handle closing
    webapp.onEvent('mainButtonClicked', () => {
        webapp.close();
    });
});
