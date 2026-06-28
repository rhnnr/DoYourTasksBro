const toggleButton = document.getElementById('toggle-btn')
const sideBar = document.getElementById('sidebar')

if(localStorage.getItem('sidebar_closed') === 'true') {
    sideBar.classList.add('close');
    toggleButton.classList.add('rotate');
}

function toggleSidebar() {
    const isClosed = sideBar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    localStorage.setItem('sidebar_closed', isClosed);
}

const inputWarnThreshold = document.getElementById('input-warn-threshold');
const inputOverloadThreshold = document.getElementById('input-overload-threshold');
const deleteHistory = document.getElementById('clear-history-btn');

document.addEventListener("DOMContentLoaded", async () => {
    const cloudSettings = await LiveSync.pullData('settings_data');
    
    const savedWarn = cloudSettings ? cloudSettings.warn : (localStorage.getItem('todo_warn_threshold') || 300);
    const savedOverload = cloudSettings ? cloudSettings.overload : (localStorage.getItem('todo_overload_threshold') || 600);

    inputWarnThreshold.value = savedWarn;
    inputOverloadThreshold.value = savedOverload;
    
    localStorage.setItem('todo_warn_threshold', savedWarn);
    localStorage.setItem('todo_overload_threshold', savedOverload);

    inputWarnThreshold.addEventListener('input', () => {
        localStorage.setItem('todo_warn_threshold', inputWarnThreshold.value);
        syncSettings();
    });

    inputOverloadThreshold.addEventListener('input', () => {
        localStorage.setItem('todo_overload_threshold', inputOverloadThreshold.value);
        syncSettings();
    });
});

function syncSettings() {
    const settingsObj = {
        warn: Number(inputWarnThreshold.value),
        overload: Number(inputOverloadThreshold.value)
    };
    LiveSync.pushData('settings_data', settingsObj);
}

deleteHistory.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm("Delete history?")) {
        localStorage.removeItem('doyourtasksbro_history');
        LiveSync.pushData('history_data', []);
    }
});

const themeToggle = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.checked = true;
}
if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
}