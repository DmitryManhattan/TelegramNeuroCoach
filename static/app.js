// Initialize Telegram WebApp
const webapp = window.Telegram.WebApp;
webapp.expand();

// Initialize state
let currentState = {
    date: new Date().toISOString().split('T')[0],
    mood: null,
    moodDescription: '',
    achievement: '',
    goals: ['', '', '']
};

// DOM Elements
const dateSelector = document.getElementById('dateSelector');
const moodButtons = document.querySelectorAll('.mood-btn');
const moodDescriptionInput = document.getElementById('moodDescription');
const achievementInput = document.getElementById('achievement');
const goalInputs = document.querySelectorAll('.goal-input');
const saveButton = document.getElementById('saveButton');
const container = document.querySelector('.container');

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        webapp.ready();
        setupEventListeners();
        setInitialDate();
        highlightMoodDates(); // Add initial highlighting
    } catch (error) {
        console.error('Error initializing WebApp:', error);
    }
});

async function highlightMoodDates() {
    try {
        const response = await fetch(`/mood-dates?initData=${encodeURIComponent(webapp.initData)}`);
        const result = await response.json();

        if (result.status === 'success') {
            // Create a style element if it doesn't exist
            let styleEl = document.getElementById('calendar-highlights');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'calendar-highlights';
                document.head.appendChild(styleEl);
            }

            // Generate CSS rules for each date
            const cssRules = result.dates.map(date => 
                `input[type="date"][value="${date}"], input[type="date"]::-webkit-calendar-picker-indicator[value="${date}"] { background-color: #90EE90; }`
            ).join('\n');

            styleEl.textContent = cssRules;

            // Add data attribute for dates with entries
            const datesSet = new Set(result.dates);
            dateSelector.dataset.moodDates = JSON.stringify(Array.from(datesSet));
        }
    } catch (error) {
        console.error('Error fetching mood dates:', error);
    }
}

function setupEventListeners() {
    // Dismiss keyboard on container click
    container.addEventListener('click', (e) => {
        if (e.target === container) {
            document.activeElement?.blur();
        }
    });

    // Date change
    dateSelector.addEventListener('change', (e) => {
        currentState.date = e.target.value;
        loadDataForDate(currentState.date);
    });

    // Calendar focus - refresh highlights
    dateSelector.addEventListener('focus', () => {
        highlightMoodDates();
    });

    // Mood selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentState.mood = btn.dataset.mood;
        });
    });

    // Mood description input
    moodDescriptionInput.addEventListener('input', (e) => {
        currentState.moodDescription = e.target.value;
    });

    // Achievement input
    achievementInput.addEventListener('input', (e) => {
        currentState.achievement = e.target.value;
    });

    // Goals input
    goalInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            currentState.goals[index] = e.target.value;
        });
    });

    // Save button
    saveButton.addEventListener('click', saveData);
}

function setInitialDate() {
    const today = new Date().toISOString().split('T')[0];
    dateSelector.value = today;
    loadDataForDate(today);
}

async function loadDataForDate(date) {
    try {
        const response = await fetch(`/mood-data?date=${date}&initData=${encodeURIComponent(webapp.initData)}`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
            // Update state
            currentState = result.data;

            // Update UI
            moodButtons.forEach(btn => {
                if (btn.dataset.mood === result.data.mood) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });

            moodDescriptionInput.value = result.data.moodDescription || '';
            achievementInput.value = result.data.achievement || '';
            result.data.goals.forEach((goal, index) => {
                goalInputs[index].value = goal || '';
            });
        } else {
            resetForm();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        webapp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось загрузить данные',
            buttons: [{type: 'ok'}]
        });
    }
}

function resetForm() {
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    moodDescriptionInput.value = '';
    achievementInput.value = '';
    goalInputs.forEach(input => input.value = '');

    currentState = {
        date: dateSelector.value,
        mood: null,
        moodDescription: '',
        achievement: '',
        goals: ['', '', '']
    };
}

async function saveData() {
    try {
        const response = await fetch('/webapp-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initData: webapp.initData,
                data: currentState
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            webapp.showPopup({
                title: 'Успех',
                message: 'Ваши данные сохранены',
                buttons: [{type: 'ok'}]
            });
            // Refresh calendar highlights after saving
            highlightMoodDates();
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        webapp.showPopup({
            title: 'Ошибка',
            message: 'Не удалось сохранить данные',
            buttons: [{type: 'ok'}]
        });
    }
}