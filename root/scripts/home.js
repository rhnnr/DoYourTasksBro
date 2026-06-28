document.addEventListener("DOMContentLoaded", async () => {
    const todoMetricNode = document.getElementById('home-todo-metric');
    
    async function calculateAndRenderLiveTelemetry() {
        console.log("[METRICS ENGINE] Aggregating matrix pipelines...");
        
        const activeTasks = await LiveSync.pullData('tasks_data') || [];
        
        let totalScoreWeight = 0;
        activeTasks.forEach(task => {
            if (task.weight) totalScoreWeight += task.weight;
        });

        if (todoMetricNode) {
            todoMetricNode.textContent = `LOAD: ${totalScoreWeight} PT`;
            
            if (totalScoreWeight >= 600) {
                todoMetricNode.style.borderColor = "#ef4444";
                todoMetricNode.style.color = "#ef4444";
            } else if (totalScoreWeight >= 300) {
                todoMetricNode.style.borderColor = "#f59e0b";
                todoMetricNode.style.color = "#f59e0b";
            } else {
                todoMetricNode.style.borderColor = "var(--sidebar-border)";
                todoMetricNode.style.color = "var(--text-second)";
            }
        }
    }

    await calculateAndRenderLiveTelemetry();

    LiveSync.connectRealtimeMatrix('tasks_data', (incomingPayload) => {
        console.log("[TELEMETRY UPDATE] Home screen intercepted external payload shift.");
        calculateAndRenderLiveTelemetry();
    });
});