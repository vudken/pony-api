window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/data');
        const data = await response.json(); 

        if (Array.isArray(data)) {
            const tableBody = document.getElementById('table-body');

            data.forEach(item => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = item.name;
                row.appendChild(nameCell);

                const phCell = document.createElement('td');
                phCell.textContent = item.ph;
                row.appendChild(phCell);

                const ecCell = document.createElement('td');
                ecCell.textContent = item.ec;
                row.appendChild(ecCell);

                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = item.description;
                row.appendChild(descriptionCell);

                tableBody.appendChild(row);
            });
        } else {
            throw new Error('Data is not in expected array format');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});