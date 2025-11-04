// Admin panel functionality
let allOrders = [];
let allProducts = [];

async function loadAdminPanel() {
    const token = localStorage.getItem('token');
    
    if (!token || currentUser?.role !== 'admin') {
        showNotification('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    await loadOrders();
    await loadProductsForAdmin();
    setupEventListeners();
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
        image: formData.get('image')
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
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editStock').value = product.stock;
    document.getElementById('editImage').value = product.image;
    
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
        image: formData.get('image')
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