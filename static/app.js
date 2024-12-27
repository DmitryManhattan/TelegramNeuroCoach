// Initialize Telegram WebApp
const webapp = window.Telegram.WebApp;
webapp.expand();

// Initialize state
let currentState = {
    date: new Date().toISOString().split('T')[0],
    mood: null,
    achievement: '',
    goals: ['', '', '']
};

// DOM Elements
const dateSelector = document.getElementById('dateSelector');
const moodButtons = document.querySelectorAll('.mood-btn');
const achievementInput = document.getElementById('achievement');
const goalInputs = document.querySelectorAll('.goal-input');

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        webapp.ready();
        setupEventListeners();
        setInitialDate();

        // Enable main button
        webapp.MainButton.setText('Сохранить');
        webapp.MainButton.show();

        // Handle save
        webapp.MainButton.onClick(saveData);
    } catch (error) {
        console.error('Error initializing WebApp:', error);
    }
});

function setupEventListeners() {
    // Date change
    dateSelector.addEventListener('change', (e) => {
        currentState.date = e.target.value;
        loadDataForDate(currentState.date);
    });

    // Mood selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentState.mood = btn.dataset.mood;
        });
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
}

function setInitialDate() {
    const today = new Date().toISOString().split('T')[0];
    dateSelector.value = today;
    loadDataForDate(today);
}

function loadDataForDate(date) {
    // Here we would typically load data from server
    // For now, we'll just reset the form
    resetForm();
}

function resetForm() {
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    achievementInput.value = '';
    goalInputs.forEach(input => input.value = '');

    currentState = {
        date: dateSelector.value,
        mood: null,
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