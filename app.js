let taskList = []

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
    taskInput.value = '';
    
    console.log(taskList);
});

