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

        // ✅ Find the earliest start date from the database
        let earliestStartDate = moment.min(
            stages.map(stage => moment(stage.startDate, "YYYY-MM-DD"))
        );

        let startDate = earliestStartDate.isValid() ? earliestStartDate : moment(); // ✅ Use earliest or today
        let events = [];

        let fragment = document.createDocumentFragment();

        stages.forEach((stage) => {
            let start = moment(stage.startDate, "YYYY-MM-DD"); // ✅ Use DB start date
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

            let stageItem = document.createElement("li");
            stageItem.className = "border-bottom py-2";
            stageItem.innerHTML = `
                <span class="badge" style="background: ${stage.color}; color: #fff;">
                    ${stage.duration} days
                </span> ${stage.name}
            `;
            fragment.appendChild(stageItem);
        });

        stageList.innerHTML = ""; // ✅ Clear previous entries
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
                left: "prev,next",
                center: "title",
                right: ""
            },
            dateClick: function (info) {
                openCalendarModal(info.dateStr, stages);
            }
        });

        calendar.render();
    } catch (error) {
        console.error("Failed to load calendar data:", error);
    }
});



function openCalendarModal(date, availableStages) {
    const dateInput = document.getElementById("selected-date");
    const stageContainer = document.getElementById("stage-selection-container");

    // ✅ Use the default `YYYY-MM-DD` format
    dateInput.value = date;

    // ✅ Clear previous stage list
    stageContainer.innerHTML = "";

    // ✅ Populate available stages (only one can be selected)
    availableStages.forEach(stage => {
        let stageItem = document.createElement("div");
        stageItem.className = "stage-option";
        stageItem.setAttribute("data-id", stage._id);
        stageItem.innerHTML = `
            <span class="stage-color" style="background: ${stage.color};"></span>
            <span class="stage-name">${stage.name} (${stage.duration} days)</span>
        `;
        stageContainer.appendChild(stageItem);

        // ✅ Click to select only one stage at a time
        stageItem.addEventListener("click", function () {
            document.querySelectorAll(".stage-option").forEach(item => item.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    document.getElementById("addStageModal").style.display = "flex"; // Show modal
}



// 🚀 Handle Start Date Confirmation
document.getElementById("confirmStartDate").addEventListener("click", async function () {
    let selectedDate = document.getElementById("selected-date").value;

    if (!selectedDate) {
        alert("Please select a valid date.");
        return;
    }

    let selectedStage = document.querySelector(".stage-option.selected");
    if (!selectedStage) {
        alert("Please select a stage.");
        return;
    }

    let selectedStageId = selectedStage.getAttribute("data-id");

    try {
        const response = await fetch("/stages/set-start-date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startDate: selectedDate, selectedStage: selectedStageId })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to set start date");

        console.log("Start date updated:", data);
        alert("Start date and stage successfully updated!");
        document.getElementById("addStageModal").style.display = "none";
        location.reload(); // Refresh calendar
    } catch (error) {
        console.error("Error setting start date:", error);
        alert("Failed to update start date. Try again.");
    }
});




// 🚀 Close Modal on Click
document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", function () {
        document.getElementById("addStageModal").style.display = "none";
    });
});
