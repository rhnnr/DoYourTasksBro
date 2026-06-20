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
const savedWarn = localStorage.getItem('todo_warn_threshold') || 300;
const savedOverload = localStorage.getItem('todo_overload_threshold') || 600;

const deleteHistory = document.getElementById('clear-history-btn');

inputWarnThreshold.value = savedWarn;
inputOverloadThreshold.value = savedOverload;

inputWarnThreshold.addEventListener('input', () => {
    localStorage.setItem('todo_warn_threshold', inputWarnThreshold.value);
});

inputOverloadThreshold.addEventListener('input', () => {
    localStorage.setItem('todo_overload_threshold', inputOverloadThreshold.value);
});

deleteHistory.addEventListener('click', (e) => {
    e.preventDefault();
    if (!confirm("Delete history?")) {
        event.preventDefault();
    } else {
        localStorage.removeItem('doyourtasksbro_history');
    }
});

// --- Global Theme Toggle ---
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