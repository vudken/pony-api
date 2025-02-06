document.addEventListener("DOMContentLoaded", function () {
    const addStageBtn = document.getElementById("add-stage-btn");
    const modal = document.getElementById("addStageModal");
    const closeModal = document.querySelector(".close");
    const submitStage = document.getElementById("submitStage");
    const tableBody = document.getElementById("stage-list");

    if (!addStageBtn || !modal || !closeModal || !submitStage) {
        console.error("One or more elements not found. Check IDs in HTML.");
        return;
    }

    // OPEN MODAL
    addStageBtn.addEventListener("click", function () {
        modal.style.display = "flex"; // Use flex to center
    });

    // CLOSE MODAL
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // CLOSE MODAL ON BACKDROP CLICK
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // COLOR SELECTION LOGIC
    document.querySelectorAll(".color-circle").forEach(circle => {
        circle.addEventListener("click", function () {
            document.querySelectorAll(".color-circle").forEach(c => c.classList.remove("selected"));
            this.classList.add("selected");
            document.getElementById("selectedColor").value = this.getAttribute("data-color");
        });
    });

    document.querySelectorAll(".remove-stage").forEach(button => {
        button.addEventListener("click", function () {
            let index = this.getAttribute("data-index");

            // ✅ Ask user for confirmation
            if (confirm("Are you sure you want to remove this stage?")) {
                fetch(`/stages/remove/${index}`, { method: "DELETE" })
                    .then(response => response.json())
                    .then(data => location.reload()) // ✅ Reload after successful deletion
                    .catch(error => console.error("Error:", error));
            }
        });
    });

    document.getElementById("remove-all-stages").addEventListener("click", function () {
        if (confirm("Are you sure you want to remove all stages? This action cannot be undone!")) {
            fetch("/stages/remove-all", { method: "DELETE" })
                .then(response => response.json())
                .then(data => location.reload()) // ✅ Refresh after deletion
                .catch(error => console.error("Error:", error));
        }
    });

    // SUBMIT FORM
    submitStage.addEventListener("click", function () {
        let name = document.getElementById("stageName").value.trim();
        let duration = parseInt(document.getElementById("stageDuration").value);
        let color = document.getElementById("selectedColor").value;
        if (!/^[A-Za-z]+[A-Za-z0-9\s]*$/.test(name)) {
            alert("Stage name must start with a letter and can contain letters, numbers, and spaces.");
            return;
        }
        if (isNaN(duration) || duration < 1) {
            alert("Duration must be a number greater than 1.");
            return;
        }

        fetch("/stages/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, duration, color })
        })
            .then(response => response.json())
            .then(data => location.reload())
            .catch(error => console.error("Error:", error));
    });

    new Sortable(tableBody, {
        animation: 150,
        handle: ".move-stage", // Use the Bootstrap arrows-expand icon as the drag handle
        onEnd: function (event) {
            const newIndex = event.newIndex;
            const oldIndex = event.oldIndex;

            fetch("/stages/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldIndex, newIndex })
            })
                .then(response => response.json())
                .then(data => location.reload()) // Refresh after reordering
                .catch(error => console.error("Error updating order:", error));
        }
    });
});