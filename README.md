# DoYourTasksBro

**Production Deployment Domain:** [https://rhnnr.github.io/DoYourTasksBro/index.html](https://rhnnr.github.io/DoYourTasksBro/index.html)  
**Public GitHub Repository:** [https://github.com/rhnnr/DoYourTasksBro](https://github.com/rhnnr/DoYourTasksBro)

---

## Project Description

Traditional productivity tools often lower performance by over-complicating task organization. Users spend excessive time structuring folders, tags, and descriptions instead of acting on their commitments. 

DoYourTasksBro solves this by introducing hard limits on list generation. Designed for individuals managing tight schedules and engineering workflows, it calculates a user's current task volume using a custom metric called the Workload Load Score. The application measures the actual string length of user inputs to determine stress thresholds. When workload bounds are exceeded, the interface shifts state and implements a total input lockout, preventing the creation of new entries until previous tasks are resolved and cleared from the board.

---

## Major Features

### Workload Load Score and Input Lockout Engine
* **String-Length Task Weighting:** Task weights are calculated based on entry length (`cleanText.length`), mapping data volume directly to psychological weight.
* **Dynamic Threshold Enforcement:** The system parses custom bounds from the data store to toggle global page states (`theme-safe`, `theme-warning`, and `theme-overload`).
* **Input Interdiction:** When the aggregate score exceeds set parameters, the interface completely disables task creation forms (`taskAdd.disabled = true`), forcing actionable completion before list modification can resume.
* **State Categorization:** Completed items are written to a secondary history cache array (`doyourtasksbro_history`) and removed from the active grid layout.

### Weekly Routine Timetable Matrix
* **Absolute Minute Placement:** Converts input time string elements into clean indices (`timeStringtoMinute`) to dynamically configure height and positioning rules (`style.top`, `style.height`) on a responsive seven-day canvas layout.
* **Validation Bounds:** Prevents scheduling errors by invalidating invalid arrays where the end time is less than or equal to the start time.
* **Granular Removal Hooks:** Each rendering cycle maps unique identifiers to node elements, allowing individual blocks to be removed cleanly from localStorage records.

### Synchronized Monthly Dot Calendar
* **Data-Driven Indicators:** Reads date markers from active lists using native JavaScript date arrays (`getMonthMetadata`) to populate monthly grids.
* **Threat Tier Visualization:** Populates matching columns with indicators (`dot-safe`, `dot-warning`, `dot-overload`) to identify high-stress dates at a glance.
* **Briefing Panel:** Captures date selections to filter and display daily schedules in a dedicated summary deck below the primary grid.

### Application Parameter Configuration
* **Custom Limit Modification:** Allows direct adjustment of warning and critical overload integers, immediately updating behavior patterns across the application.
* **History Purging:** Features a secure deletion mechanism to completely clear historical task arrays from the browser data store.
* **Persistent Visual Modes:** Includes an interface switch to toggle between light and dark modes, tracking user choice with a global theme variable wrapper.

### Typography Decryption Mechanic
* **Asynchronous Scramble Animation:** Uses a character array interval loop to process text elements on mouse interaction, decoding string configurations smoothly on the platform's overview section.

---

## In-Project Screenshots

### Todo-List Interface
![Todo-List Interface](<root/images/test screenshots/Screenshot (194).png>)

### Weekly Routine Allocation Canvas
![Weekly Timetable Matrix Interface](<root/images/test screenshots/Screenshot (196).png>)


### Monthly Load Distribution Grid
![Monthly Load Distribution Grid](<root/images/test screenshots/Screenshot (197).png>)

---

## Build and Installation Process

This system operates strictly on native web runtime engines. It requires no configuration layers, runtime compilers, task runners, or package dependencies to execute locally.

### Setup Instructions

1. **Clone the project repository:**
```bash
   git clone [https://github.com/rhnnr/DoYourTasksBro.git](https://github.com/rhnnr/DoYourTasksBro.git)
   cd DoYourTasksBro