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
        updateDateHighlights(); // Initialize date highlights
    } catch (error) {
        console.error('Error initializing WebApp:', error);
    }
});

async function updateDateHighlights() {
    try {
        const response = await fetch(`/mood-dates?initData=${encodeURIComponent(webapp.initData)}`);
        const result = await response.json();

        if (result.status === 'success') {
            const dates = new Set(result.dates);
            // Store dates in the dataset for future reference
            dateSelector.dataset.moodDates = JSON.stringify(Array.from(dates));

            // Apply the highlight class if the current date has an entry
            if (dates.has(dateSelector.value)) {
                dateSelector.classList.add('has-entry');
            } else {
                dateSelector.classList.remove('has-entry');
            }
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
        updateDateHighlights();
    });

    // Calendar focus - refresh highlights
    dateSelector.addEventListener('focus', () => {
        updateDateHighlights();
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
            // Update date highlights after saving
            updateDateHighlights();
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