document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/stages/data");
        const stages = await response.json();

        const stageList = document.getElementById("stage-list");
        if (!stageList) {
            console.error("Element #stage-list not found!");
            return;
        }

        const calendarEl = document.getElementById("calendar");
        if (!calendarEl) {
            console.error("Element #calendar not found!");
            return;
        }

        let startDate = moment("2025-02-01");
        let events = [];

        let fragment = document.createDocumentFragment();

        stages.forEach((stage) => {
            let start = startDate.clone();
            let end = start.clone().add(stage.duration, "days");

            events.push({
                title: stage.name,
                start: start.format("YYYY-MM-DD"),
                end: end.format("YYYY-MM-DD"),
                backgroundColor: stage.color,
                borderColor: stage.color,
                display: "block",
                extendedProps: { duration: stage.duration }
            });

            startDate = end.clone();

            let stageItem = document.createElement("li");
            stageItem.className = "border-bottom py-2";
            stageItem.innerHTML = `
                <span class="badge" style="background: ${stage.color}; color: #fff;">
                    ${stage.duration} days
                </span> ${stage.name}
            `;
            fragment.appendChild(stageItem);
        });

        stageList.appendChild(fragment);

        let viewportHeight = window.innerHeight;
        let navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
        let headerHeight = document.querySelector(".calendar-card h2")?.offsetHeight || 50;
        let availableHeight = viewportHeight - navbarHeight - headerHeight - 60;

        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            themeSystem: "bootstrap",
            height: Math.max(availableHeight, 600),
            events: events,
            headerToolbar: {
                left: "prev,next",  // ✅ Keeps only prev/next on the left
                center: "title",    // ✅ Keeps month title in the center
                right: ""           // ✅ Removes today button & right-side buttons
            }
        });

        calendar.render();
    } catch (error) {
        console.error("Failed to load calendar data:", error);
    }
});
