// Global variables
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    await checkAuthStatus();
    updateCartCount();
    initializeHeroSlider();
    await loadFeaturedProducts();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Logout handler
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('authDropdown');
        const userIcon = document.getElementById('userIcon');
        
        if (userIcon && !userIcon.contains(event.target) && dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Authentication functions
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                currentUser = await response.json();
                updateAuthUI();
            } else {
                // Token is invalid, clear it
                localStorage.removeItem('token');
                currentUser = null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            currentUser = null;
        }
    }
    updateAuthUI();
}

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
        if (userIcon) userIcon.textContent = '👤';
    }
}

function toggleAuthDropdown() {
    const dropdown = document.getElementById('authDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Logout function
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

// Hero Slider
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }
    
    // Auto slide change
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
    
    // Dot click events
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
}

// Product functions
async function loadFeaturedProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products/featured');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        
        const grid = document.getElementById('featuredProductsGrid');
        if (grid) {
            grid.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-img" style="background-image: url('${product.image}')"></div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">$${product.price}</p>
                        <div class="product-actions">
                            <button class="btn btn-small" onclick="addToCart(${product.id})">Add to Cart</button>
                            <button class="btn btn-outline btn-small" onclick="viewProduct(${product.id})">View</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load featured products:', error);
        showNotification('Failed to load featured products', 'error');
    }
}

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Cart functions
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

async function addToCart(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!', 'success');
    } catch (error) {
        console.error('Failed to add product to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}

// Search functionality
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

// Newsletter subscription
async function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('Please enter your email address', 'warning');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }
    
    try {
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        emailInput.value = '';
    } catch (error) {
        showNotification('Failed to subscribe to newsletter', 'error');
    }
}

// Utility functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}