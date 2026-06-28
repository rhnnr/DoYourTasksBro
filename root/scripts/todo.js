let taskList = []; 
let taskHistory = [];

const toggleButton = document.getElementById('toggle-btn');
const sideBar = document.getElementById('sidebar');

if(localStorage.getItem('sidebar_closed') === 'true') {
    sideBar.classList.add('close');
    toggleButton.classList.add('rotate');
}

function toggleSidebar() {
    const isClosed = sideBar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    localStorage.setItem('sidebar_closed', isClosed);
}

const storedWarn = localStorage.getItem('todo_warn_threshold');
const storedOverload = localStorage.getItem('todo_overload_threshold');
const warningThreshold = storedWarn !== null ? Number(storedWarn) : 300;
const overloadThreshold = storedOverload !== null ? Number(storedOverload) : 600;

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input'); 
const taskAdd = document.getElementById('task-add');
const taskDeadline = document.getElementById('task-deadline');
const scoreNum = document.getElementById('score-number');
const gravityBoard = document.getElementById('gravity-board');
const liveCounter = document.getElementById('live-weight-counter');

const todoView = document.getElementById('todo-view');
const historyView = document.getElementById('history-section');
const tabTodo = document.getElementById('tab-todo');
const tabHistory = document.getElementById('tab-history');

document.addEventListener("DOMContentLoaded", async () => {
    initThemeState();

    console.log("[BOOT] Fetching data vectors from Supabase...");
    
    const cloudTasks = await LiveSync.pullData('tasks_data');
    const cloudHistory = await LiveSync.pullData('history_data');

    if (cloudTasks !== null) {
        taskList = cloudTasks;
    } else {
        const savedData = localStorage.getItem('doyourtasksbro_data');
        taskList = savedData ? JSON.parse(savedData).filter(item => item.weight !== undefined) : [];
    }

    if (cloudHistory !== null) {
        taskHistory = cloudHistory;
    } else {
        const savedHistory = localStorage.getItem('doyourtasksbro_history');
        taskHistory = savedHistory ? JSON.parse(savedHistory) : [];
    }

    renderBoard();
    updateGlobalMetrics();
    renderHistory();

    LiveSync.connectRealtimeMatrix('tasks_data', (incomingPayload) => {
        taskList = incomingPayload;
        renderBoard();
        updateGlobalMetrics();
        localStorage.setItem('doyourtasksbro_data', JSON.stringify(taskList));
    });

    LiveSync.connectRealtimeMatrix('history_data', (incomingPayload) => {
        taskHistory = incomingPayload;
        renderHistory();
        localStorage.setItem('doyourtasksbro_history', JSON.stringify(taskHistory));
    });
});

taskInput.addEventListener('input', () => {
    const currentTextLength = taskInput.value.length;
    liveCounter.textContent = currentTextLength;
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cleanText = taskInput.value.trim();

    if (cleanText.length === 0) return;

    const taskObject = {
        id: Date.now(),
        text: cleanText,
        weight: cleanText.length,
        deadline: taskDeadline.value
    };

    taskList.push(taskObject); 
    
    renderBoard(); 
    taskInput.value = '';
    taskDeadline.value = '';
    liveCounter.textContent = 0;

    updateGlobalMetrics();
    saveAndSyncData();
});

function renderBoard() { 
    taskList.sort((a, b) => {
        if (a.deadline === '' && b.deadline === '') return 0;
        if (a.deadline === '') return 1;
        if (b.deadline === '') return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    gravityBoard.innerHTML = ''; 

    taskList.forEach(task => {
        const card = document.createElement('div'); 
        card.classList.add('card');

        if (task.weight < 100) {
            card.classList.add('card-low');
        } else if (task.weight >= 100 && task.weight < 150) {
            card.classList.add('card-mid');
        } else {
            card.classList.add('card-high');
        }

        const taskText = document.createElement('p');
        taskText.textContent = task.text;
        card.appendChild(taskText); 

        const cardFooter = document.createElement('div');
        cardFooter.classList.add('card-footer');

        if (task.deadline && task.deadline.length > 0) {
            const deadline = document.createElement('span');
            deadline.textContent = task.deadline;
            deadline.classList.add('card-deadline');
            cardFooter.appendChild(deadline);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Done';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            task.completedAt = Date.now();
            taskHistory.push(task);

            taskList = taskList.filter(taskItem => taskItem.id !== task.id); 
            renderBoard(); 
            updateGlobalMetrics();
            saveAndSyncData();
            renderHistory();
        });        
        cardFooter.appendChild(deleteBtn);
        card.appendChild(cardFooter);
        card.style.setProperty('--card-weight', task.weight); 

        gravityBoard.appendChild(card);
    });
}

function updateGlobalMetrics() {
    let totalScore = 0;
    taskList.forEach(task => { totalScore += task.weight; });
    scoreNum.textContent = totalScore;

    if (totalScore < warningThreshold) {
        document.body.classList.remove('theme-warning', 'theme-overload');
        document.body.classList.add('theme-safe');
        taskAdd.disabled = false;
        taskInput.disabled = false;
    } else if (totalScore >= warningThreshold && totalScore < overloadThreshold) {
        document.body.classList.remove('theme-safe', 'theme-overload');
        document.body.classList.add('theme-warning');
        taskAdd.disabled = false;
        taskInput.disabled = false;
    } else {
        document.body.classList.remove('theme-safe', 'theme-warning');
        document.body.classList.add('theme-overload');
        taskAdd.disabled = true;
        taskInput.disabled = true;
    }
}

function saveAndSyncData() {
    localStorage.setItem('doyourtasksbro_data', JSON.stringify(taskList));
    localStorage.setItem('doyourtasksbro_history', JSON.stringify(taskHistory));

    LiveSync.pushData('tasks_data', taskList);
    LiveSync.pushData('history_data', taskHistory);
}

function renderHistory() {
    const historyLog = document.getElementById('history-log');
    historyLog.innerHTML = '';

    taskHistory.forEach(taskhistory => {
        const historyList = document.createElement('p');
        historyList.classList.add('history-item');
        historyLog.appendChild(historyList);
        historyList.textContent = taskhistory.text;
    });
}

tabTodo.addEventListener('click', () => {
    todoView.classList.remove('hidden');
    gravityBoard.classList.remove('hidden');
    historyView.classList.add('hidden');
    tabTodo.classList.add('active');
    gravityBoard.classList.add('active');
    tabHistory.classList.remove('active');
});

tabHistory.addEventListener('click', () => {
    historyView.classList.remove('hidden');
    todoView.classList.add('hidden');
    gravityBoard.classList.add('hidden');
    tabHistory.classList.add('active');
    tabTodo.classList.remove('active');
    gravityBoard.classList.remove('active');
});

function initThemeState() {
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
}