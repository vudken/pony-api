document.addEventListener('DOMContentLoaded', function () {
    fetch('/stages/data')
        .then(response => response.json())
        .then(stages => {
            let stageList = document.getElementById("stage-list");
            if (!stageList) {
                console.error("Element #stage-list not found!");
                return;
            }

            let startDate = moment("2025-02-01"); // ✅ Base start date
            let events = [];

            stages.forEach(stage => {
                let start = startDate.clone(); // ✅ Ensure proper date handling
                let end = start.clone().add(stage.duration, 'days'); // ✅ Remove "-1" to fill days properly

                let event = {
                    title: stage.name,
                    start: start.format("YYYY-MM-DD"),
                    end: end.format("YYYY-MM-DD"), // ✅ Fixes gaps
                    backgroundColor: stage.color,
                    borderColor: stage.color,
                    display: "block",
                    extendedProps: {
                        duration: stage.duration
                    }
                };
                events.push(event);

                startDate = end.clone(); // ✅ Move startDate forward for next stage

                let stageItem = `<li class="border-bottom py-2">
                    <span class="badge" style="background: ${stage.color}; color: #fff;">
                        ${stage.duration} days
                    </span> ${stage.name}
                </li>`;
                stageList.innerHTML += stageItem;
            });

            var calendarEl = document.getElementById('calendar');
            if (!calendarEl) {
                console.error("Element #calendar not found!");
                return;
            }

            // ✅ Calculate the available height dynamically, preventing overflow
            let viewportHeight = window.innerHeight;
            let navbarHeight = document.querySelector(".navbar")?.offsetHeight || 0;
            let headerHeight = document.querySelector(".calendar-card h2")?.offsetHeight || 50;
            let availableHeight = viewportHeight - navbarHeight - headerHeight - 60; // Extra margin

            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                themeSystem: 'bootstrap',
                height: Math.max(availableHeight, 600), // ✅ Prevents going too small
                events: events
            });

            calendar.render();
        })
        .catch(error => console.error("Failed to load calendar data:", error));
});