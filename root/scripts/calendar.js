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

document.addEventListener("DOMContentLoaded", async () => {
    let currentViewDate = new Date();
    
    savedTasks = JSON.parse(localStorage.getItem("doyourtasksbro_data")) || [];
    calendarEvents = JSON.parse(localStorage.getItem("doyourtasksbro_events")) || [];
    renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);

    if (window.LiveSync) {
        const cloudTasks = await LiveSync.pullData('tasks_data');
        const cloudEvents = await LiveSync.pullData('calendar_data');
        
        if (cloudTasks !== null) savedTasks = cloudTasks;
        if (cloudEvents !== null) calendarEvents = cloudEvents;
        
        renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);

        LiveSync.connectRealtimeMatrix('tasks_data', (incomingPayload) => {
            savedTasks = incomingPayload;
            renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
        });

        LiveSync.connectRealtimeMatrix('calendar_data', (incomingPayload) => {
            calendarEvents = incomingPayload;
            renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
        });
    }

    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggle && window.toggleSidebar) {
        sidebarToggle.addEventListener('click', window.toggleSidebar);
    }

    const prevBtn = document.getElementById("prev-month-btn");
    const nextBtn = document.getElementById("next-month-btn");
    if (prevBtn) prevBtn.addEventListener("click", () => { currentViewDate.setMonth(currentViewDate.getMonth() - 1); renderCalendarGrid(currentViewDate, savedTasks, calendarEvents); });
    if (nextBtn) nextBtn.addEventListener("click", () => { currentViewDate.setMonth(currentViewDate.getMonth() + 1); renderCalendarGrid(currentViewDate, savedTasks, calendarEvents); });

    const openModalBtn = document.getElementById('open-modal-btn');
    const eventModal = document.getElementById('event-modal');
    const selectTags = document.querySelector('#saved-tags');
    const cancelBtn = document.querySelector('.btn-cancel');
    const saveBtn = document.querySelector('.btn-save');
    const eventTitle = document.querySelector('.event-title');
    const eventDate = document.querySelector('.event-date');

    function fetchTagCollection() {
        const storedTags = JSON.parse(localStorage.getItem("doyourtasksbro_tags"));
        return storedTags || [{ id: "tag-1", name: "Exam", color: "#FF9800" }, { id: "tag-2", name: "Birthday", color: "#E91E63"}];
    }

    function dropDownMenu() {
        if (!selectTags) return;
        const tagsList = fetchTagCollection();
        selectTags.innerHTML = "";
        tagsList.forEach((tag) => {
            const option = document.createElement('option');
            option.text = tag.name; option.value = tag.name;
            selectTags.appendChild(option);
        });
        const newTagOption = document.createElement('option');
        newTagOption.value = 'new'; newTagOption.text = '+ Create New Tag';
        selectTags.appendChild(newTagOption);
    }
    dropDownMenu();

    if (selectTags) selectTags.addEventListener('change', () => {
        const tagInputs = document.querySelector('.custom-tag-inputs');
        if (tagInputs) selectTags.value === 'new' ? tagInputs.classList.remove('hidden') : tagInputs.classList.add('hidden');
    });

    if (openModalBtn) openModalBtn.addEventListener('click', () => eventModal?.classList.remove('hidden'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => eventModal?.classList.add('hidden'));
    
    if (saveBtn) saveBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        let finalTagName = selectTags.value;
        const customTagName = document.querySelector('.custom-tag-name');
        const customTagColor = document.querySelector('.custom-tag-color');

        if (selectTags.value === 'new' && customTagName) {
            finalTagName = customTagName.value;
            const currentTags = fetchTagCollection();
            currentTags.push({ name: customTagName.value, color: customTagColor.value });
            localStorage.setItem('doyourtasksbro_tags', JSON.stringify(currentTags));
            dropDownMenu();
        }

        calendarEvents.push({ text: eventTitle.value, deadline: eventDate.value, tag: finalTagName });
        localStorage.setItem('doyourtasksbro_events', JSON.stringify(calendarEvents));
        if (window.LiveSync) await LiveSync.pushData('calendar_data', calendarEvents);

        if (eventModal) eventModal.classList.add('hidden');
        if (eventTitle) eventTitle.value = '';
        if (customTagName) customTagName.value = '';
        renderCalendarGrid(currentViewDate, savedTasks, calendarEvents);
    });
});