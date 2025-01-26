document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/data'); // Fetch data from a new API route
        const data = await response.json();

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear the loading message

        if (data.error) {
            // Display an error message if fetching failed
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">
                        <div class="alert alert-danger" role="alert">
                            <strong>Error:</strong> ${data.error}
                        </div>
                    </td>
                </tr>`;
        } else if (data.length > 0) {
            // Populate the table with data
            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.ph}</td>
                        <td>${item.ec}</td>
                        <td>${item.description}</td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
        } else {
            // Show "No data available"
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No data available</td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <div class="alert alert-danger" role="alert">
                        <strong>Error:</strong> Failed to fetch data. Please try again later.
                    </div>
                </td>
            </tr>`;
    }
});