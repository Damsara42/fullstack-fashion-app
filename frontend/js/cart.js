// Cart management
function loadCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Browse our products and add items to your cart.</p>
                <a href="products.html" class="btn">Start Shopping</a>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
                ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                ${item.color ? `<p>Color: ${item.color}</p>` : ''}
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">🗑️ Remove</button>
            </div>
        </div>
    `).join('');
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = formatCurrency(total);
    }
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Item removed from cart', 'success');
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
    showNotification('Cart cleared', 'success');
}

// Checkout functions
async function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    if (!currentUser) {
        showNotification('Please login to proceed with checkout', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout';
        }, 1500);
        return;
    }
    
    window.location.href = 'checkout.html';
}

async function handleCheckout(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orderData = {
        shippingAddress: {
            name: formData.get('name'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode'),
            country: formData.get('country')
        },
        paymentMethod: formData.get('paymentMethod'),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const order = await response.json();
            showNotification('Order placed successfully!', 'success');
            clearCart();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}