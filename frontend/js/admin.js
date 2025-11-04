// Admin panel functionality
let allOrders = [];
let allProducts = [];

async function loadAdminPanel() {
    console.log('Loading admin panel...');
    
    // Check authentication first
    await checkAuthStatus();
    
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Current user:', currentUser);
    
    if (!token || !currentUser) {
        console.log('No token or user, redirecting to login...');
        showNotification('Please login to access admin panel', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (currentUser.role !== 'admin') {
        console.log('User is not admin, redirecting to home...');
        showNotification('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('User is admin, loading admin data...');
    await loadAdminStats();
    await loadOrders();
    await loadProductsForAdmin();
    setupEventListeners();
    
    showNotification('Admin panel loaded successfully', 'success');
}

async function loadAdminStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalOrders').textContent = stats.totalOrders;
            document.getElementById('totalProducts').textContent = stats.totalProducts;
            document.getElementById('pendingOrders').textContent = stats.pendingOrders;
            document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
        } else {
            throw new Error('Failed to load stats');
        }
    } catch (error) {
        console.error('Failed to load admin stats:', error);
        // Set default values
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('pendingOrders').textContent = '0';
        document.getElementById('totalRevenue').textContent = '$0';
    }
}

async function loadOrders() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            allOrders = await response.json();
            displayOrders();
        } else {
            throw new Error('Failed to load orders');
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

async function loadProductsForAdmin() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            allProducts = await response.json();
            displayProductsForAdmin();
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (allOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.user_name}</td>
            <td>${order.user_email}</td>
            <td>${formatCurrency(order.total_amount)}</td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${order.status}
                </span>
            </td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="canceled" ${order.status === 'canceled' ? 'selected' : ''}>Canceled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function displayProductsForAdmin() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = allProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-small btn-outline" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showNotification('Order status updated successfully', 'success');
            await loadOrders(); // Reload orders to reflect changes
            await loadAdminStats(); // Update stats
        } else {
            throw new Error('Failed to update order status');
        }
    } catch (error) {
        console.error('Failed to update order status:', error);
        showNotification('Failed to update order status', 'error');
    }
}

function setupEventListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Edit product form
    const editProductForm = document.getElementById('editProductFormContent');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        stock: parseInt(formData.get('stock')),
        image: formData.get('image'),
        featured: formData.get('featured') ? 1 : 0
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showNotification('Product added successfully', 'success');
            event.target.reset();
            await loadProductsForAdmin();
            await loadAdminStats();
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Failed to add product:', error);
        showNotification('Failed to add product: ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showNotification('Product deleted successfully', 'success');
            await loadProductsForAdmin();
            await loadAdminStats();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Failed to delete product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Populate form with product data
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editDescription').value = product.description || '';
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editStock').value = product.stock;
    document.getElementById('editImage').value = product.image || '';
    document.getElementById('editFeatured').checked = product.featured === 1;
    
    // Show edit form
    document.getElementById('editProductForm').style.display = 'block';
}

async function handleEditProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        stock: parseInt(formData.get('stock')),
        image: formData.get('image'),
        featured: formData.get('featured') ? 1 : 0
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showNotification('Product updated successfully', 'success');
            event.target.reset();
            document.getElementById('editProductForm').style.display = 'none';
            await loadProductsForAdmin();
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Failed to update product:', error);
        showNotification('Failed to update product: ' + error.message, 'error');
    }
}

// Make functions globally available
window.updateOrderStatus = updateOrderStatus;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.handleEditProduct = handleEditProduct;