
let userId = null;

// User Registration
async function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const rollNumber = document.getElementById('roll-number').value.trim();
    const casualLeave = Number(document.getElementById('casual-leave').value);
    const medicalLeave = Number(document.getElementById('medical-leave').value);

    const message = document.getElementById('registration-response');

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username, email, rollNumber, casualLeave, medicalLeave
            })
        });

        const data = await response.json();
        message.innerText = data.message ||
            (response.ok ? 'Registration successful!' : 'Registration failed.');

        if (response.ok) {
            document.getElementById('registration-form').reset();
            document.getElementById('registration-section').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        message.innerText = 'Unable to contact the server. Check the terminal.';
    }
}

// User Login
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('dashboard-message');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.message || 'Login failed.';
            return;
        }

        userId = data.userId;

        document.getElementById('username-display').innerText = data.username;
        document.getElementById('roll-number-display').innerText = data.rollNumber;
        document.getElementById('casual-leave-display').innerText = data.casualLeave;
        document.getElementById('medical-leave-display').innerText = data.medicalLeave;

        document.getElementById('login-section').style.display = 'none';
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';

        message.innerText = `Welcome, ${data.username}!`;
    } catch (error) {
        console.error('Login error:', error);
        message.innerText = 'Unable to contact the server. Check the terminal.';
    }
}

// User Logout
function logoutUser() {
    userId = null;

    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('registration-section').style.display = 'none';

    document.getElementById('dashboard-message').innerText = '';
    document.getElementById('login-form').reset();
    document.getElementById('leave-form').reset();
}

// Refresh Leave Balance
async function refreshLeaveBalance() {
    if (!userId) return;

    const message = document.getElementById('dashboard-message');

    try {
        const response = await fetch(`/api/leave-balance/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.message || 'Could not refresh balance.';
            return;
        }

        document.getElementById('casual-leave-display').innerText = data.casualLeave;
        document.getElementById('medical-leave-display').innerText = data.medicalLeave;
        message.innerText = 'Leave balance updated.';
    } catch (error) {
        console.error('Balance error:', error);
        message.innerText = 'Unable to contact the server.';
    }
}

// Apply for Leave
async function applyLeave(event) {
    event.preventDefault();

    if (!userId) return;

    const type = document.getElementById('leave-type').value;
    const days = Number(document.getElementById('leave-days').value);
    const message = document.getElementById('dashboard-message');

    if (!Number.isInteger(days) || days <= 0) {
        message.innerText = 'Enter a valid number of leave days.';
        return;
    }

    try {
        const response = await fetch(`/api/apply-leave/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, days })
        });

        const data = await response.json();
        message.innerText = data.message ||
            (response.ok ? 'Leave applied successfully.' : 'Leave application failed.');

        if (response.ok) {
            document.getElementById('casual-leave-display').innerText = data.casualLeave;
            document.getElementById('medical-leave-display').innerText = data.medicalLeave;
            document.getElementById('leave-form').reset();
        }
    } catch (error) {
        console.error('Apply leave error:', error);
        message.innerText = 'Unable to contact the server.';
    }
}

// Switch between Login and Registration
document.getElementById('show-login').addEventListener('click', function () {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('registration-section').style.display = 'none';
});

document.getElementById('show-registration').addEventListener('click', function () {
    document.getElementById('registration-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
});

// Form and button events
document.getElementById('registration-form')
    .addEventListener('submit', registerUser);

document.getElementById('login-form')
    .addEventListener('submit', loginUser);

document.getElementById('refresh-balance')
    .addEventListener('click', refreshLeaveBalance);

document.getElementById('logout-button')
    .addEventListener('click', logoutUser);

document.getElementById('leave-form')
    .addEventListener('submit', applyLeave);
