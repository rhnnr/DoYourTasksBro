let taskList = []; // the global array

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

const savedData = localStorage.getItem('doyourtasksbro_data');

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input'); // Input field
const taskAdd = document.getElementById('task-add');
const taskDeadline = document.getElementById('task-deadline');
const scoreNum = document.getElementById('score-number');
const gravityBoard = document.getElementById('gravity-board');
const liveCounter = document.getElementById('live-weight-counter');

if (savedData !== null) {
    taskList = JSON.parse(savedData);
} else {
    taskList = [];
}

taskInput.addEventListener('input', () => {
    const currentTextLength = taskInput.value.length;
    liveCounter.textContent = currentTextLength;
});


taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cleanText = taskInput.value.trim();

    if (cleanText.length === 0) {
        return;
    }

    const taskObject = {
        id: Date.now(),
        text: cleanText,
        weight: cleanText.length,
        deadline: taskDeadline.value
    };

    taskList.push(taskObject); // pushing a variable to the global array
    renderBoard(); // call to render
    taskInput.value = '';
    taskDeadline.value = '';
    liveCounter.textContent = 0;
    updateGlobalMetrics(); // update the global metrics
    console.log(taskList);

    saveData();
});


function renderBoard() { // function declaration
    taskList.sort((a, b) => {
        if (a.deadline === '' && b.deadline === '') {
            return 0;
        }
        if (a.deadline === '') {
            return 1;
        }
        if (b.deadline === '') {
            return -1;
        }
        return new Date(a.deadline) - new Date(b.deadline);
    });

    gravityBoard.innerHTML = ''; // clear the board before rendering

    taskList.forEach(task => {
        const card = document.createElement('div'); //parent
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
        card.appendChild(taskText); // append the task text to the card

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
            taskList = taskList.filter(taskItem => taskItem.id !== task.id); //remove task from the array
            renderBoard(); // re-render :)
            updateGlobalMetrics();
            saveData();
            
        });        
        cardFooter.appendChild(deleteBtn);
        card.appendChild(cardFooter);

        card.style.setProperty('--card-weight', task.weight); 

        gravityBoard.appendChild(card);
    });
}


renderBoard(); // clear any placeholder
updateGlobalMetrics();


function updateGlobalMetrics() {
    let totalScore = 0;

    taskList.forEach(task => {
        totalScore += task.weight;
    });
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
        taskInput.disabled = true
    }

}


function saveData() {
    const stringifiedVar = JSON.stringify(taskList);
    localStorage.setItem('doyourtasksbro_data', stringifiedVar);
}
