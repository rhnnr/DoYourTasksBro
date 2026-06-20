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

inputWarnThreshold.value = savedWarn;
inputOverloadThreshold.value = savedOverload;

inputWarnThreshold.addEventListener('input', () => {
    localStorage.setItem('todo_warn_threshold', inputWarnThreshold.value);
});

inputOverloadThreshold.addEventListener('input', () => {
    localStorage.setItem('todo_overload_threshold', inputOverloadThreshold.value);
});