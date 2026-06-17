let taskList = []; // the global array

const warningThreshold = 150;
const overloadThreshold = 300;

const savedData = localStorage.getItem('doyourtasksbro_data');

if (savedData !== null) {
    taskList = JSON.parse(savedData);
} else {
    taskList = [];
}

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input'); // Input field
const scoreNum = document.getElementById('score-number');
const gravityBoard = document.getElementById('gravity-board');

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const cleanText = taskInput.value.trim();

    if (cleanText.length === 0) {
        return;
    }

    const taskObject = {
        id: Date.now(),
        text: cleanText,
        weight: cleanText.length
    };

    taskList.push(taskObject); // pushing a variable to the global array
    renderBoard(); // call to render
    taskInput.value = '';
    updateGlobalMetrics(); // update the global metrics
    console.log(taskList);

    saveData();
});

function renderBoard() { // function declaration
    gravityBoard.innerHTML = ''; // clear the board before rendering

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
        card.appendChild(taskText); // append the task text to the card

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Done';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            taskList = taskList.filter(taskItem => taskItem.id !== task.id); //remove task from the array
            renderBoard(); // re-render :)
            updateGlobalMetrics();
            saveData();
        });
        card.appendChild(deleteBtn);

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
    } else if (totalScore >= warningThreshold && totalScore < overloadThreshold) {
        document.body.classList.remove('theme-safe', 'theme-overload');
        document.body.classList.add('theme-warning');
    } else {
        document.body.classList.remove('theme-safe', 'theme-warning');
        document.body.classList.add('theme-overload');
    }

}

function saveData() {
    const stringifiedVar = JSON.stringify(taskList);
    localStorage.setItem('doyourtasksbro_data', stringifiedVar);
}