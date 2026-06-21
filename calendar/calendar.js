function getMonthMetadata(year, month) {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return { firstDayIndex, totalDays };
}

function formatSystemDate(year, month, day) {
    const stringMonth = String(month + 1).padStart(2, '0');
    const stringDay = String(day).padStart(2, '0');
    const stringDate = `${year}-${stringMonth}-${stringDay}`;
    return stringDate;
}

function evaluateDayLoad(taskList, targetDate) {
    const matchedTasks = taskList.filter(task => task.deadline === targetDate);

    let totalWeight = 0;
    matchedTasks.forEach(task => {
        totalWeight += task.weight;
    });

    const storedWarn = localStorage.getItem('todo_warn_threshold');
    const storedOverload = localStorage.getItem('todo_overload_threshold');
    const warningLimit = storedWarn !== null ? Number(storedWarn) : 300;
    const overloadLimit = storedOverload !== null ? Number(storedOverload) : 600;

    let threatTier = "safe";

    if (totalWeight < 100) {
        threatTier = "safe";
    } else if (totalWeight >= 100 && totalWeight < 150 ) {
        threatTier = "warning";
    } else {
        threatTier = "overload";
    }

    return { matchedTasks, threatTier };
}

function renderCalendarGrid(displayDate, taskList) {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    document.getElementById('month-year-display').textContent = `${months[month]} ${year}`;

    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const { firstDayIndex, totalDays } = getMonthMetadata(year, month);
    const realTimeToday = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateString = formatSystemDate(year, month, day);
        const { matchedTasks, threatTier } = evaluateDayLoad(taskList, dateString);

        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');

        if (
            day === realTimeToday.getDate() &&
            month === realTimeToday.getMonth() &&
            year === realTimeToday.getFullYear()
        ) {
            dayCell.classList.add('today');
        }

        const dayNumLabel = document.createElement('span');
        dayNumLabel.classList.add('day-number');
        dayNumLabel.textContent = day;

        dayCell.appendChild(dayNumLabel);

        if (matchedTasks.length > 0) {
            const dotContainer = document.createElement('div');
            dotContainer.classList.add('dot-container');

            const dot = document.createElement('span');
            dot.classList.add('indicator-dot');
            dot.classList.add(`dot-${threatTier}`);

            dotContainer.appendChild(dot);
            dayCell.appendChild(dotContainer);
        }

        dayCell.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
            });

            dayCell.classList.add('selected');
            document.getElementById('selected-date-label').textContent = dateString;

            const deck = document.getElementById('filtered-task-deck');
            deck.innerHTML = '';

            if (matchedTasks.length === 0) {
                deck.innerHTML = `<div class="task-deck-placeholder">No tasks scheduled for this day.</div>`;
            } else {
                deck.innerHTML = "";
                matchedTasks.forEach(task => {
                    deck.innerHTML += `
                        <div style="background: rgba(255, 255, 255, 0.02); margin-bottom: 8px; padding: 12px; border-radius: 6px; border-left: 4px solid var(--selected-bg); display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                            <span style="color: var(--text-main); font-weight: 500; text-align: left; word-break: break-word;">${task.text || "Untitled Task"}</span>
                            <span style="color: var(--text-second); font-family: monospace; font-size: 0.85rem; padding: 4px 8px; background: rgba(0,0,0,0.3); border-radius: 4px; flex-shrink: 0; white-space: nowrap;">LOAD: ${task.weight || 0}</span>
                        </div>`;
                });
            }
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let currentViewDate = new Date();

    const savedTasks = JSON.parse(localStorage.getItem("doyourtasksbro_data")) || [];

    renderCalendarGrid(currentViewDate, savedTasks);

    const prevBtn = document.getElementById("prev-month-btn");
    const nextBtn = document.getElementById("next-month-btn");

    prevBtn.addEventListener("click", () => {
        currentViewDate.setMonth(currentViewDate.getMonth() - 1);
        renderCalendarGrid(currentViewDate, savedTasks);
    });

    nextBtn.addEventListener("click", () => {
        currentViewDate.setMonth(currentViewDate.getMonth() + 1);
        renderCalendarGrid(currentViewDate, savedTasks);
    });
});