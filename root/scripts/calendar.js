let savedTasks = []; 
let calendarEvents = [];

function getMonthMetadata(year, month) {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDayIndex, totalDays };
}

function formatSystemDate(year, month, day) {
    const stringMonth = String(month + 1).padStart(2, '0');
    const stringDay = String(day).padStart(2, '0');
    return `${year}-${stringMonth}-${stringDay}`;
}

function evaluateDayLoad(taskList, targetDate) {
    const matchedTasks = taskList.filter(task => task.deadline === targetDate);
    let totalWeight = 0;
    matchedTasks.forEach(task => { totalWeight += task.weight; });

    let threatTier = "safe";
    if (totalWeight >= 150) {
        threatTier = "overload";
    } else if (totalWeight >= 100) {
        threatTier = "warning";
    }
    return { matchedTasks, threatTier };
}

function getTagColor(tagName) {
    const storedTags = JSON.parse(localStorage.getItem("doyourtasksbro_tags"));
    const tagList = storedTags || [
        { id: "tag-1", name: "Exam", color: "#FF9800"},
        { id: "tag-2", name: "Birthday", color: "#E91E63"}
    ];
    const matchTag = tagList.find(tag => tag.name === tagName);
    return matchTag ? matchTag.color : "#3B82F6";
}

function renderCalendarGrid(displayDate, taskList, eventList) {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    document.getElementById('month-year-display').textContent = `${months[month]} ${year}`;
    document.getElementById('mini-month-year-display').textContent = `${months[month]} ${year}`;

    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';

    const { firstDayIndex, totalDays } = getMonthMetadata(year, month);
    const realTimeToday = new Date();

    const totalSlotsNeeded = firstDayIndex + totalDays;
    const rowCount = Math.ceil(totalSlotsNeeded / 7);
    calendarGrid.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;

    function updateBriefingDeck(targetDateString) {
        const matchedTasks = taskList.filter(item => item.deadline === targetDateString);
        const matchedEvents = eventList.filter(item => item.deadline === targetDateString);
        const combinedItems = [...matchedTasks, ...matchedEvents];
        
        const deck = document.getElementById('filtered-task-deck');
        if (!deck) return;
        deck.innerHTML = '';

        if (combinedItems.length === 0) {
            deck.innerHTML = `<div class="task-deck-placeholder">No items scheduled for this day.</div>`;
        } else {
            combinedItems.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.className = 'briefing-item-card';
                const isTask = item.weight !== undefined;
                const badgeText = isTask ? `LOAD: ${item.weight}` : `TAG: ${item.tag}`;
                
                itemCard.innerHTML = `
                    <div class="briefing-card-main-info">
                        <span class="briefing-card-text">${item.text || "Untitled"}</span>
                        <span class="briefing-card-badge">${badgeText}</span>
                    </div>
                `;

                if (!isTask) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'event-delete-btn';
                    deleteBtn.innerHTML = '&times;';
                    deleteBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const masterIndex = calendarEvents.findIndex(t => t.text === item.text && t.deadline === item.deadline && t.tag === item.tag);
                        if (masterIndex !== -1) {
                            calendarEvents.splice(masterIndex, 1);
                            localStorage.setItem('doyourtasksbro_events', JSON.stringify(calendarEvents));
                            if (window.LiveSync) await LiveSync.pushData('calendar_data', calendarEvents);
                            renderCalendarGrid(displayDate, taskList, calendarEvents);
                            updateBriefingDeck(targetDateString);
                        }
                    });
                    itemCard.appendChild(deleteBtn);
                }
                deck.appendChild(itemCard);
            });
        }
    }

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateString = formatSystemDate(year, month, day);
        const dailyTasks = taskList.filter(item => item.deadline === dateString);
        const dailyEvents = eventList.filter(item => item.deadline === dateString);
        const { threatTier } = evaluateDayLoad(dailyTasks, dateString);

        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');

        if (day === realTimeToday.getDate() && month === realTimeToday.getMonth() && year === realTimeToday.getFullYear()) {
            dayCell.classList.add('today');
        }

        const headerRow = document.createElement('div');
        headerRow.classList.add('day-header-row');

        const dayNumLabel = document.createElement('span');
        dayNumLabel.classList.add('day-number');
        dayNumLabel.textContent = day;
        headerRow.appendChild(dayNumLabel);

        if (dailyTasks.length > 0) {
            const dotContainer = document.createElement('div');
            dotContainer.classList.add('dot-container');
            const dot = document.createElement('span');
            dot.classList.add('indicator-dot', `dot-${threatTier}`);
            dotContainer.appendChild(dot);
            headerRow.appendChild(dotContainer);
        }

        dayCell.appendChild(headerRow);
        
        if (dailyEvents.length > 0) {
            if (dailyEvents.length <= 2) {
                dailyEvents.forEach(eventItem => {
                    const eventColor = getTagColor(eventItem.tag);
                    const ribbonElement = document.createElement('div');
                    ribbonElement.classList.add('event-ribbon');
                    ribbonElement.textContent = eventItem.text;
                    ribbonElement.style.backgroundColor = eventColor;
                    dayCell.appendChild(ribbonElement);
                });
            } else {
                const chipContainer = document.createElement('div');
                chipContainer.classList.add('event-chip-container');
                const visibleEvents = dailyEvents.slice(0, 4);
                visibleEvents.forEach(eventItem => {
                    const eventColor = getTagColor(eventItem.tag);
                    const chipElement = document.createElement('div');
                    chipElement.classList.add('event-color-chip');
                    chipElement.style.backgroundColor = eventColor;
                    chipElement.title = eventItem.text;
                    chipContainer.appendChild(chipElement);
                });
                dayCell.appendChild(chipContainer);
            }
        }

        dayCell.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
            dayCell.classList.add('selected');
            document.getElementById('selected-date-label').textContent = dateString;
            updateBriefingDeck(dateString);
        });
        calendarGrid.appendChild(dayCell);
    }

    const miniCalendarGrid = document.getElementById('mini-calendar-grid');
    if (!miniCalendarGrid) return;
    miniCalendarGrid.innerHTML = '';

    for (let i = 0; i < firstDayIndex; i++) {
        const miniEmptyCell = document.createElement('div');
        miniEmptyCell.classList.add('mini-day', 'empty');
        miniCalendarGrid.appendChild(miniEmptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateString = formatSystemDate(year, month, day);
        const dailyEvents = eventList.filter(item => item.deadline === dateString);

        const miniDayCell = document.createElement('div');
        miniDayCell.classList.add('mini-day');
        miniDayCell.textContent = day;

        if (dailyEvents.length > 0) {
            const miniDot = document.createElement('span');
            miniDot.classList.add('indicator-dot');
            const dotColor = getTagColor(dailyEvents[0].tag);
            miniDot.style.backgroundColor = dotColor;
            miniDayCell.appendChild(miniDot);
        }
        miniCalendarGrid.appendChild(miniDayCell);
    }
}

function initializeCalendarLifecycle() {
    let currentViewDate = new Date();
    
    savedTasks = JSON.parse(localStorage.getItem("doyourtasksbro_data")) || [];
    calendarEvents = JSON.parse(localStorage.getItem("doyourtasksbro_events")) || [];
    renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);

    if (typeof LiveSync !== 'undefined') {
        console.log("[LIVESYNC CONNECTION] Hooking up global Postgres tables...");
        
        LiveSync.pullData('tasks_data').then(cloudTasks => {
            if (cloudTasks !== null) {
                savedTasks = cloudTasks;
                renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
            }
        });

        LiveSync.pullData('calendar_data').then(cloudEvents => {
            if (cloudEvents !== null) {
                calendarEvents = cloudEvents;
                renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
            }
        });

        LiveSync.connectRealtimeMatrix('tasks_data', (incomingPayload) => {
            savedTasks = incomingPayload;
            renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
            localStorage.setItem('doyourtasksbro_data', JSON.stringify(savedTasks));
        });

        LiveSync.connectRealtimeMatrix('calendar_data', (incomingPayload) => {
            calendarEvents = incomingPayload;
            renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
            localStorage.setItem('doyourtasksbro_events', JSON.stringify(calendarEvents));
        });
    } else {
        console.warn("[RETRY] LiveSync object not instantiated yet. Retrying bridge... ");
    }

    const prevBtn = document.getElementById("prev-month-btn");
    const nextBtn = document.getElementById("next-month-btn");
    if (prevBtn) prevBtn.onclick = () => { currentViewDate.setMonth(currentViewDate.getMonth() - 1); renderCalendarGrid(currentViewDate, savedTasks, calendarEvents); };
    if (nextBtn) nextBtn.onclick = () => { currentViewDate.setMonth(currentViewDate.getMonth() + 1); renderCalendarGrid(currentViewDate, savedTasks, calendarEvents); };

    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.onclick = async (event) => {
            event.preventDefault();
            const selectTags = document.querySelector('#saved-tags');
            const eventTitle = document.querySelector('.event-title');
            const eventDate = document.querySelector('.event-date');
            const customTagName = document.querySelector('.custom-tag-name');
            const customTagColor = document.querySelector('.custom-tag-color');
            const eventModal = document.getElementById('event-modal');

            let finalTagName = selectTags ? selectTags.value : "General";

            if (selectTags && selectTags.value === 'new' && customTagName) {
                finalTagName = customTagName.value;
                const storedTags = JSON.parse(localStorage.getItem("doyourtasksbro_tags")) || [];
                storedTags.push({ name: customTagName.value, color: customTagColor.value });
                localStorage.setItem('doyourtasksbro_tags', JSON.stringify(storedTags));
            }

            calendarEvents.push({ text: eventTitle.value, deadline: eventDate.value, tag: finalTagName });
            localStorage.setItem('doyourtasksbro_events', JSON.stringify(calendarEvents));
            
            if (typeof LiveSync !== 'undefined') await LiveSync.pushData('calendar_data', calendarEvents);

            if (eventModal) eventModal.classList.add('hidden');
            if (eventTitle) eventTitle.value = '';
            if (customTagName) customTagName.value = '';
            renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
        };
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(initializeCalendarLifecycle, 50);
    });
} else {
    setTimeout(initializeCalendarLifecycle, 50);
}