// Product listing and filtering
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentSort = 'name';

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        populateCategories();
    } catch (error) {
        console.error('Failed to load products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-img" style="background-image: url('${product.image}')"></div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
                <p class="product-description">${product.description.substring(0, 80)}...</p>
                <div class="product-actions">
                    <button class="btn btn-small" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="btn btn-outline btn-small" onclick="viewProduct(${product.id})">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const categories = ['all', ...new Set(allProducts.map(product => product.category))];
    
    categoryFilter.innerHTML = categories.map(category => `
        <option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const sort = document.getElementById('sortFilter')?.value || 'name';
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort products
    sortProducts(sort);
    displayProducts();
}

function sortProducts(sortBy) {
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
        default:
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
}

// Product detail functions
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const product = await response.json();
        
        displayProductDetail(product);
        await loadRelatedProducts(product.category, productId);
    } catch (error) {
        console.error('Failed to load product detail:', error);
        showNotification('Failed to load product details', 'error');
    }
}

function displayProductDetail(product) {
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    container.innerHTML = `
        <div class="product-detail-container">
            <div class="product-image">
                <div class="main-image" style="background-image: url('${product.image}')"></div>
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="product-price">$${product.price}</p>
                <p class="product-description">${product.description}</p>
                
                <div class="product-options">
                    <div class="option-group">
                        <label>Size:</label>
                        <select id="sizeSelect">
                            <option value="S">Small</option>
                            <option value="M">Medium</option>
                            <option value="L">Large</option>
                            <option value="XL">X-Large</option>
                        </select>
                    </div>
                    
                    <div class="option-group">
                        <label>Color:</label>
                        <select id="colorSelect">
                            <option value="black">Black</option>
                            <option value="white">White</option>
                            <option value="navy">Navy</option>
                            <option value="burgundy">Burgundy</option>
                        </select>
                    </div>
                    
                    <div class="option-group">
                        <label>Quantity:</label>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
                            <span id="quantityDisplay">1</span>
                            <button class="quantity-btn" onclick="increaseQuantity()">+</button>
                        </div>
                    </div>
                </div>
                
                <button class="btn" onclick="addToCartWithOptions(${product.id})">Add to Cart</button>
            </div>
        </div>
    `;
}

let currentQuantity = 1;

function increaseQuantity() {
    currentQuantity++;
    document.getElementById('quantityDisplay').textContent = currentQuantity;
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('quantityDisplay').textContent = currentQuantity;
    }
}

async function addToCartWithOptions(productId) {
    const size = document.getElementById('sizeSelect').value;
    const color = document.getElementById('colorSelect').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        const product = await response.json();
        
        const existingItem = cart.find(item => 
            item.id === productId && 
            item.size === size && 
            item.color === color
        );
        
        if (existingItem) {
            existingItem.quantity += currentQuantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size: size,
                color: color,
                quantity: currentQuantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!', 'success');
        
        // Reset quantity
        currentQuantity = 1;
        document.getElementById('quantityDisplay').textContent = currentQuantity;
    } catch (error) {
        console.error('Failed to add product to cart:', error);
        showNotification('Failed to add product to cart', 'error');
    }
}

async function loadRelatedProducts(category, excludeId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/category/${category}`);
        let products = await response.json();
        
        // Exclude current product and limit to 4
        products = products.filter(product => product.id != excludeId).slice(0, 4);
        
        const container = document.getElementById('relatedProducts');
        if (container && products.length > 0) {
            container.innerHTML = `
                <h2>Related Products</h2>
                <div class="products-grid">
                    ${products.map(product => `
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
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load related products:', error);
    }
}