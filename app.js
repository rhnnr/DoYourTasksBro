let taskList = [] // the global array

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
});

function renderBoard() { // function declaration
    gravityBoard.innerHTML = ''; // clear the board before rendering

    taskList.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('card');

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
        });
        card.appendChild(deleteBtn);

        card.style.setProperty('--card-weight', task.weight); 

        gravityBoard.appendChild(card);
    });
}

renderBoard(); // clear any placeholder

function updateGlobalMetrics() {
    let totalScore = 0;
    taskList.forEach(task => {
        totalScore += task.weight;
    });
    scoreNum.textContent = totalScore;
}