// Authentication functions
async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            showNotification('Login successful!', 'success');
            
            setTimeout(() => {
                if (currentUser.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function registerUser(name, email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    currentUser = null;
    cart = [];
    localStorage.removeItem('cart');
    updateAuthUI();
    updateCartCount();
    showNotification('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Form handlers
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    loginUser(email, password);
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'warning');
        return;
    }
    
    registerUser(name, email, password);
}

// Update auth UI function
function updateAuthUI() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    const adminLink = document.getElementById('adminLink');
    const userIcon = document.getElementById('userIcon');

    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'block';
            // Ensure logout link has the correct event listener
            logoutLink.onclick = logoutUser;
        }
        if (userIcon) userIcon.textContent = '👤';
        
        if (currentUser.role === 'admin' && adminLink) {
            adminLink.style.display = 'block';
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Add event listener for logout link when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Re-attach logout event listener
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
});