// Initialize Telegram WebApp
const webapp = window.Telegram.WebApp;

// Expand to viewport
webapp.expand();

// Ready event
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the WebApp
        webapp.ready();

        // Set the header color to match Telegram theme
        document.body.style.backgroundColor = webapp.backgroundColor;

        // Enable the main button
        webapp.MainButton.setText('Close App');
        webapp.MainButton.show();

        // Send data back to Telegram when main button is clicked
        webapp.MainButton.onClick(() => {
            fetch('/webapp-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: webapp.initData,
                    colorScheme: webapp.colorScheme
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                webapp.close();
            })
            .catch(error => {
                console.error('Error:', error);
                webapp.showAlert('An error occurred');
            });
        });
    } catch (error) {
        console.error('Error initializing WebApp:', error);
    }
});