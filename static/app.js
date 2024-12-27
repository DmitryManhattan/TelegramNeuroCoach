
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

function createCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    
    let calendarHTML = '';
    
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const formattedDate = date.toISOString().split('T')[0];
        calendarHTML += `<div class="calendar-day" data-date="${formattedDate}">${day}</div>`;
    }

    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.innerHTML = calendarHTML;
    }
}

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
        createCalendar();
        updateDateHighlights();
    } catch (error) {
        console.error('Error initializing WebApp:', error);
    }
});

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

    // Mood selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentState.mood = btn.dataset.mood;
        });
    });

    // Calendar day click
    document.getElementById('calendar').addEventListener('click', (e) => {
        const dayElement = e.target.closest('.calendar-day');
        if (dayElement) {
            const selectedDate = dayElement.dataset.date;
            dateSelector.value = selectedDate;
            currentState.date = selectedDate;
            loadDataForDate(selectedDate);
        }
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
            currentState = result.data;

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

async function updateDateHighlights() {
    try {
        const response = await fetch(`/mood-dates?initData=${encodeURIComponent(webapp.initData)}`);
        const result = await response.json();

        if (result.status === 'success') {
            const moodDates = result.mood_dates;
            
            // Get all mood buttons to map their colors
            const moodColorMap = Array.from(moodButtons).reduce((map, btn) => {
                map[btn.dataset.mood] = getComputedStyle(btn).backgroundColor;
                return map;
            }, {});

            // Update calendar days with stored moods
            document.querySelectorAll('.calendar-day').forEach(day => {
                const date = day.dataset.date;
                const mood = moodDates[date];
                if (mood) {
                    day.style.backgroundColor = moodColorMap[mood];
                    day.style.opacity = '0.3';
                }
            });
        }
    } catch (error) {
        console.error('Error fetching mood dates:', error);
    }
}
