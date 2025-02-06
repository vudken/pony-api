document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector(".toggle-sidebar");
    const sidebar = document.querySelector(".sidebar");
    const links = document.querySelectorAll(".sidebar a");
    function clearActiveLinks() {
        links.forEach(link => link.classList.remove("active"));
    }
    function setActiveLink() {
        const currentPath = window.location.pathname;
        clearActiveLinks(); // Remove active class from all
        const activeLink = document.querySelector(`.sidebar a[href="${currentPath}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
            localStorage.setItem("activeLink", currentPath); // Update storage
        }
    }
    function updateToggleButtonVisibility() {
        if (window.innerWidth <= 768) {
            toggleButton.style.display = 'block';
        } else {
            toggleButton.style.display = 'none';
            sidebar.classList.remove('show');
        }
    };
    setActiveLink();
    updateToggleButtonVisibility();
    links.forEach(link => {
        link.addEventListener("click", function () {
            localStorage.setItem("activeLink", this.getAttribute("href"));
            setActiveLink(); // Ensure highlighting updates correctly
        });
    });
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    window.addEventListener('resize', updateToggleButtonVisibility);
});