// --- Global State Layer ---
let scheduleList = [];

const savedSchedule = localStorage.getItem('doyourtimebro_data');
const toggleButton = document.getElementById('toggle-btn');
const sideBar = document.getElementById('sidebar');

const scheduleForm = document.getElementById('schedule-form');
const blockLabel = document.getElementById('block-label');
const blockDay = document.getElementById('block-day');
const blockStart = document.getElementById('block-start');
const blockEnd = document.getElementById('block-end');

// --- Sync Local Storage Base ---
if (savedSchedule !== null) {
    scheduleList = JSON.parse(savedSchedule);
} else {
    scheduleList = [];
}

// --- Sidebar Persistent State Integration ---
if (localStorage.getItem('sidebar_closed') === 'true') {
    sideBar.classList.add('close');
    toggleButton.classList.add('rotate');
}

function toggleSidebar() {
    const isClosed = sideBar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    localStorage.setItem('sidebar_closed', isClosed);
}

// --- Helper Functions: Coordinate Conversion Engine ---
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
}

function formatDisplayTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // Convert '0' to '12'
    return `${h}:${minutes} ${ampm}`;
}

// --- Form Input Dispatcher ---
scheduleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const labelText = blockLabel.value.trim();
    const startMins = timeToMinutes(blockStart.value);
    const endMins = timeToMinutes(blockEnd.value);

    // Timeline validation guard
    if (endMins <= startMins) {
        alert("Execution Error: End time must occur after the start time, Bro.");
        return;
    }

    const scheduleObject = {
        id: Date.now(),
        label: labelText,
        day: blockDay.value,
        start: blockStart.value,
        end: blockEnd.value
    };

    scheduleList.push(scheduleObject);
    renderMatrix();
    saveScheduleData();

    // Reset fields cleanly
    blockLabel.value = '';
    blockStart.value = '';
    blockEnd.value = '';
});

// --- Dynamic Canvas Render Loop ---
function renderMatrix() {
    // Clear out any old elements from all day column canvas tracks
    const canvases = document.querySelectorAll('.track-canvas');
    canvases.forEach(canvas => canvas.innerHTML = '');

    scheduleList.forEach(block => {
        // Target correct day element pipeline
        const targetCanvas = document.querySelector(`#col-${block.day} .track-canvas`);
        if (!targetCanvas) return;

        // Execute Coordinate Mathematics
        const startPos = timeToMinutes(block.start);
        const durationHeight = timeToMinutes(block.end) - startPos;

        // Build Master Layout Elements
        const blockNode = document.createElement('div');
        blockNode.classList.add('schedule-block');
        
        // Dynamic absolute sizing configuration inline vector injection
        blockNode.style.top = `${startPos}px`;
        blockNode.style.height = `${durationHeight}px`;

        const labelText = document.createElement('span');
        labelText.classList.add('block-label');
        labelText.textContent = block.label;

        const durationText = document.createElement('span');
        durationText.classList.add('block-duration');
        durationText.textContent = `${formatDisplayTime(block.start)} - ${formatDisplayTime(block.end)}`;

        // Build deletion action link trigger
        const removeHandle = document.createElement('span');
        removeHandle.innerHTML = '&times;';
        removeHandle.classList.add('block-remove-btn');
        removeHandle.addEventListener('click', (e) => {
            e.stopPropagation(); // Shield bubble loop execution
            scheduleList = scheduleList.filter(item => item.id !== block.id);
            renderMatrix();
            saveScheduleData();
        });

        // Assemble Layout Tree
        blockNode.appendChild(removeHandle);
        blockNode.appendChild(labelText);
        blockNode.appendChild(durationText);
        targetCanvas.appendChild(blockNode);
    });
}

function saveScheduleData() {
    localStorage.setItem('doyourtimebro_data', JSON.stringify(scheduleList));
}

// Initial paint lifecycle trigger
renderMatrix();