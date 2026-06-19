let globalSchedule = [];

const scheduleForm = document.getElementById('schedule-form');
const blockLabel = document.getElementById('block-label');
const blockDay = document.getElementById('block-day');
const blockStart = document.getElementById('block-start');
const blockEnd = document.getElementById('block-end');
const timetableData = localStorage.getItem('timetable-data');

if(localStorage.getItem('sidebar_closed') === 'true') {
    sideBar.classList.add('close');
    toggleButton.classList.add('rotate')
}


function toggleSidebar() {
    const isClosed = sideBar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    localStorage.setItem('sidebar_closed', isClosed);
}


if (timetableData !== null) {
    globalSchedule = JSON.parse(timetableData);
} else {
    globalSchedule = [];
}

// just learned it 2:53 AM 6/19/2026
const timeStringtoMinute = (timeString) => {
    return timeString.split(":").reduce((h, m) => h * 60 + Number(m), 0);
}

// "submit" is the event the short for function ()=>{ inside here is what the unamed function do}
scheduleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const schedLabel = blockLabel.value;
    const schedDay = document.querySelectorAll('#block-day input[type="checkbox"]:checked');
    const schedStart = blockStart.value;
    const schedEnd = blockEnd.value;

    const startMins = timeStringtoMinute(schedStart);
    const endMins = timeStringtoMinute(schedEnd);

    if (endMins <= startMins) {
        alert("Time travel is not possible my Bro");
        return;
    }

    if (schedDay.length === 0) {
        alert("Uhm.. Select at least one!");
        return;
    }

    schedDay.forEach((checkbox, index) => {
        const scheduleObjects = {
            id: Date.now() + index,
            label: schedLabel,
            day: checkbox.value,
            start: schedStart,
            end: schedEnd
        };
        
        globalSchedule.push(scheduleObjects);
    });
    
    localStorage.setItem('timetable-data', JSON.stringify(globalSchedule));

    document.querySelectorAll('#block-day input[type="checkbox"]').forEach(cb => cb.checked = false);
    blockLabel.value = '';
    blockStart.value = '';
    blockEnd.value = '';

    renderMatrix()
});

function renderMatrix () {
    const canvases = document.querySelectorAll('.track-canvas');
    canvases.forEach((canvas) => canvas.innerHTML = '');

    globalSchedule.forEach((schedule) => {
        const targetCanvas = document.querySelector(`#col-${schedule.day} .track-canvas`);
        
        const topPos = timeStringtoMinute(schedule.start);
        const blockHeight = timeStringtoMinute(schedule.end) - topPos;

        const cardBlueprint = document.createElement('div');
        cardBlueprint.classList.add('schedule-block');
        cardBlueprint.style.top = `${topPos}px`;
        cardBlueprint.style.height = `${blockHeight}px`;

        const cardDisplayText = document.createElement('span');
        cardDisplayText.classList.add('card-text');
        cardDisplayText.textContent = schedule.label;

        const cardTime = document.createElement('span');
        cardTime.classList.add('card-time');
        cardTime.textContent = `${schedule.start} - ${schedule.end}`;

        const cardDelete = document.createElement('button');
        cardDelete.classList.add('block-remove-btn');
        cardDelete.textContent = 'x';
        cardBlueprint.dataset.id = schedule.id;

        cardDelete.addEventListener("click", () => {
            globalSchedule = globalSchedule.filter(item => item.id !== schedule.id);
            renderMatrix();
            localStorage.setItem('timetable-data', JSON.stringify(globalSchedule));
        });
        
        cardBlueprint.appendChild(cardDisplayText);
        cardBlueprint.appendChild(cardTime);
        cardBlueprint.appendChild(cardDelete);
        targetCanvas.appendChild(cardBlueprint);
    });
}

renderMatrix();


