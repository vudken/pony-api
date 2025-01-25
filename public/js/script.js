document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const contentContainer = document.getElementById('content-container');

    // Check if the user is authenticated
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                contentContainer.style.display = 'block';
            } else {
                loginContainer.style.display = 'block';
            }
        });

    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            window.location.reload();
        } else {
            alert('Login failed');
        }
    });
});