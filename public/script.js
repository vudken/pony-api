window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch data from the API endpoint
        const response = await fetch('/api/data');
        const data = await response.json(); // Parse JSON response

        // Check if data is in array format
        if (Array.isArray(data)) {
            const tableBody = document.getElementById('table-body');

            data.forEach(item => {
                const row = document.createElement('tr');

                // Create and append Name column
                const nameCell = document.createElement('td');
                nameCell.textContent = item.name;
                row.appendChild(nameCell);

                // Create and append PH column
                const phCell = document.createElement('td');
                phCell.textContent = item.ph;
                row.appendChild(phCell);

                // Create and append EC column
                const ecCell = document.createElement('td');
                ecCell.textContent = item.ec;
                row.appendChild(ecCell);

                // Create and append Description column
                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = item.description;
                row.appendChild(descriptionCell);

                // Append the row to the table body
                tableBody.appendChild(row);
            });
        } else {
            throw new Error('Data is not in expected array format');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});