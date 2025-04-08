document.addEventListener("DOMContentLoaded", function () {
    const addStageBtn = document.getElementById("add-stage-btn");
    const modal = document.getElementById("addStageModal");
    const closeModal = document.querySelector(".close");
    const submitStage = document.getElementById("submitStage");
    const stageList = document.getElementById("stage-list");

    if (!addStageBtn || !modal || !closeModal || !submitStage) {
        console.error("One or more elements not found. Check IDs in HTML.");
        return;
    }

    addStageBtn.addEventListener("click", function () {
        modal.style.display = "flex"; // Use flex to center
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    document.querySelectorAll(".color-circle").forEach(circle => {
        circle.addEventListener("click", function () {
            document.querySelectorAll(".color-circle").forEach(c => c.classList.remove("selected"));
            this.classList.add("selected");
            document.getElementById("selectedColor").value = this.getAttribute("data-color");
        });
    });

    document.querySelectorAll(".remove-stage").forEach(button => {
        // button.addEventListener("click", function () {
        //     let index = this.getAttribute("data-index");

        //     // ✅ Ask user for confirmation
        //     if (confirm("Are you sure you want to remove this stage?")) {
        //         fetch(`/stages/remove/${index}`, { method: "DELETE" })
        //             .then(response => response.json())
        //             .then(data => location.reload()) // ✅ Reload after successful deletion
        //             .catch(error => console.error("Error:", error));
        //     }
        // });

        button.addEventListener("click", async function () {
            if (!confirm("Are you sure you want to delete this stage? This action cannot be undone!")) {
                return;
            }

            try {
                const stageId = this.getAttribute("data-id"); // ✅ Get MongoDB `_id`
                console.log("Deleting stage with ID:", stageId);
                const response = await fetch(`/stages/remove/${stageId}`, { method: "DELETE" });

                const result = await response.json();
                console.log("Server Response:", result);

                if (response.ok) {
                    location.reload(); // ✅ Refresh after deletion
                } else {
                    alert("Error: " + result.error);
                }
            } catch (error) {
                console.error("Error deleting stage:", error);
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

    submitStage.addEventListener("click", function () {
        let name = document.getElementById("stageName").value.trim();
        let duration = parseInt(document.getElementById("stageDuration").value);
        let color = document.getElementById("selectedColor").value;
        let pumpAval = parseInt(document.getElementById("pumpAml").value) || 0;
        let pumpBval = parseInt(document.getElementById("pumpBml").value) || 0;
        let pumpCval = parseInt(document.getElementById("pumpCml").value) || 0;


        if (!/^[A-Za-z]+[A-Za-z0-9\s]*$/.test(name)) {
            alert("Stage name must start with a latin letter and can contain only letters, numbers, and spaces.");
            return;
        }
        if (isNaN(duration) || duration < 1) {
            alert("Duration must be a number greater than 1.");
            return;
        }

        fetch("/stages/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, duration, color, pumps: { pumpA: pumpAval, pumpB: pumpBval, pumpC: pumpCval } })
        })
            .then(response => response.json())
            .then(data => location.reload())
            .catch(error => console.error("Error:", error));
    });

    // new Sortable(stageList, {
    //     animation: 150,
    //     handle: ".move-stage", // Use the Bootstrap arrows-expand icon as the drag handle
    //     onEnd: function (event) {
    //         const newIndex = event.newIndex;
    //         const oldIndex = event.oldIndex;

    //         fetch("/stages/reorder", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ oldIndex, newIndex })
    //         })
    //             .then(response => response.json())
    //             .then(data => location.reload()) // Refresh after reordering
    //             .catch(error => console.error("Error updating order:", error));
    //     }
    // });

    if (!stageList) {
        console.error("Stage list element not found!");
        return;
    }

    
    const sortable = new Sortable(stageList, {
        animation: 150,
        onEnd: async function (event) {
            if (event.oldIndex === event.newIndex) return; // No change, skip request

            const draggedElement = event.item; // The element being dragged
            const targetElement = stageList.children[event.newIndex]; // The new position

            if (!draggedElement || !targetElement) {
                console.error("Invalid elements for swapping");
                return;
            }

            // ✅ Get positions correctly
            const fromPosition = Number(draggedElement.getAttribute("data-position"));
            const toPosition = Number(targetElement.getAttribute("data-position"));

            if (isNaN(fromPosition) || isNaN(toPosition)) {
                console.error("Invalid positions:", { fromPosition, toPosition });
                return;
            }

            console.log("Swapping positions:", { fromPosition, toPosition });

            try {
                const response = await fetch("/stages/reorder", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fromPosition: fromPosition,
                        toPosition: toPosition
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Failed to swap positions");

                console.log("Reordering successful:", data);

                // ✅ Update `data-position` attributes
                draggedElement.setAttribute("data-position", toPosition);
                targetElement.setAttribute("data-position", fromPosition);

            } catch (error) {
                console.error("Error swapping positions:", error);
            }
        }
    });
});