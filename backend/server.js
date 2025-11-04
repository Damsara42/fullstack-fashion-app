const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'velvet_vogue_jwt_secret_2023';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database initialization with proper async handling
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create tables sequentially to ensure they exist before inserting data
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
            } else {
                console.log('Users table created/verified');
            }
        });

        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image TEXT,
            category TEXT,
            stock INTEGER DEFAULT 0,
            featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating products table:', err);
            } else {
                console.log('Products table created/verified');
            }
        });

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_details TEXT,
            total_amount REAL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`, (err) => {
            if (err) {
                console.error('Error creating orders table:', err);
            } else {
                console.log('Orders table created/verified');
            }
        });

        // Wait for tables to be created, then insert sample data
        setTimeout(() => {
            insertSampleData();
        }, 100);
    });
}

function insertSampleData() {
    console.log('Starting to insert sample data...');
    
    // Insert default admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
        ['Admin User', 'admin@velvetvogue.com', adminPassword, 'admin'], 
        function(err) {
            if (err) {
                console.error('Error inserting admin user:', err);
            } else {
                if (this.changes > 0) {
                    console.log('Admin user created');
                } else {
                    console.log('Admin user already exists');
                }
            }
        }
    );

    // Insert sample user
    const userPassword = bcrypt.hashSync('user123', 10);
    db.run(`INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)`, 
        ['Demo User', 'user@example.com', userPassword],
        function(err) {
            if (err) {
                console.error('Error inserting demo user:', err);
            } else {
                if (this.changes > 0) {
                    console.log('Demo user created');
                } else {
                    console.log('Demo user already exists');
                }
            }
        }
    );

    // Insert sample products
    const sampleProducts = [
        {
            name: 'Elegant Evening Dress',
            description: 'A stunning evening dress perfect for special occasions. Made with premium fabric for maximum comfort and style.',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'dresses',
            stock: 15,
            featured: 1
        },
        {
            name: 'Classic Blazer',
            description: 'A timeless blazer that adds sophistication to any outfit. Perfect for both professional and casual settings.',
            price: 89.99,
            image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'jackets',
            stock: 20,
            featured: 1
        },
        {
            name: 'Casual Summer Top',
            description: 'Light and comfortable top ideal for warm weather. Features a modern design with breathable fabric.',
            price: 39.99,
            image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'tops',
            stock: 25,
            featured: 1
        },
        {
            name: 'Designer Handbag',
            description: 'Luxurious handbag with ample space and elegant design. Crafted from high-quality materials.',
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'accessories',
            stock: 10,
            featured: 1
        },
        {
            name: 'Slim Fit Jeans',
            description: 'Comfortable and stylish slim fit jeans that flatter your figure. Made from durable denim material.',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'bottoms',
            stock: 30,
            featured: 0
        },
        {
            name: 'Winter Wool Coat',
            description: 'Warm and cozy wool coat for cold weather. Features a classic design with modern touches.',
            price: 149.99,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'jackets',
            stock: 12,
            featured: 0
        },
        {
            name: 'Silk Scarf',
            description: 'Elegant silk scarf with beautiful patterns. Perfect accessory for any outfit.',
            price: 29.99,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'accessories',
            stock: 50,
            featured: 0
        },
        {
            name: 'Leather Boots',
            description: 'High-quality leather boots that combine style and durability. Perfect for all seasons.',
            price: 119.99,
            image: 'https://images.unsplash.com/photo-1542280756-74b2f55e73ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            category: 'shoes',
            stock: 18,
            featured: 0
        }
    ];

    let productsInserted = 0;
    sampleProducts.forEach((product, index) => {
        db.run(`INSERT OR IGNORE INTO products (name, description, price, image, category, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product.name, product.description, product.price, product.image, product.category, product.stock, product.featured],
            function(err) {
                if (err) {
                    console.error(`Error inserting product ${product.name}:`, err);
                } else {
                    if (this.changes > 0) {
                        productsInserted++;
                    }
                }
                
                // Check if all products have been processed
                if (index === sampleProducts.length - 1) {
                    setTimeout(() => {
                        console.log(`Sample data insertion completed. ${productsInserted} products inserted/verified`);
                        console.log('Database initialized with sample data');
                    }, 500);
                }
            }
        );
    });
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error('Database error in register:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (row) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
                [name, email, hashedPassword], 
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ message: 'Error creating user' });
                    }

                    res.status(201).json({ 
                        message: 'User created successfully',
                        userId: this.lastID 
                    });
                }
            );
        });
    } catch (error) {
        console.error('Server error in register:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('Database error in login:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            console.error('Database error in auth/me:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    });
});

// Product Routes
app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (category && category !== 'all') {
        query += ' AND category = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY name';

    db.all(query, params, (err, products) => {
        if (err) {
            console.error('Database error in products:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

app.get('/api/products/featured', (req, res) => {
    db.all('SELECT * FROM products WHERE featured = 1 LIMIT 4', (err, products) => {
        if (err) {
            console.error('Database error in featured products:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            console.error('Database error in product detail:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    });
});

app.get('/api/products/category/:category', (req, res) => {
    const { category } = req.params;

    db.all('SELECT * FROM products WHERE category = ?', [category], (err, products) => {
        if (err) {
            console.error('Database error in category products:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

// Order Routes
app.post('/api/orders', authenticateToken, (req, res) => {
    const { shippingAddress, paymentMethod, items, total } = req.body;
    const userId = req.user.id;

    if (!shippingAddress || !paymentMethod || !items || !total) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const orderDetails = JSON.stringify({
        shippingAddress,
        paymentMethod,
        items
    });

    db.run(
        'INSERT INTO orders (user_id, order_details, total_amount) VALUES (?, ?, ?)',
        [userId, orderDetails, total],
        function(err) {
            if (err) {
                console.error('Order creation error:', err);
                return res.status(500).json({ message: 'Error creating order' });
            }

            res.status(201).json({
                message: 'Order created successfully',
                orderId: this.lastID
            });
        }
    );
});

app.get('/api/orders/my-orders', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        `SELECT o.*, u.name as user_name, u.email as user_email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         WHERE o.user_id = ? 
         ORDER BY o.created_at DESC`,
        [userId],
        (err, orders) => {
            if (err) {
                console.error('Database error in my-orders:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            // Parse order details
            try {
                orders.forEach(order => {
                    order.order_details = JSON.parse(order.order_details);
                });
            } catch (parseErr) {
                console.error('Error parsing order details:', parseErr);
            }

            res.json(orders);
        }
    );
});

// Admin Routes
app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
    db.all(
        `SELECT o.*, u.name as user_name, u.email as user_email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC`,
        (err, orders) => {
            if (err) {
                console.error('Database error in admin orders:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            // Parse order details
            try {
                orders.forEach(order => {
                    order.order_details = JSON.parse(order.order_details);
                });
            } catch (parseErr) {
                console.error('Error parsing order details:', parseErr);
            }

            res.json(orders);
        }
    );
});

app.put('/api/admin/orders/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'canceled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                console.error('Database error in update order:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json({ message: 'Order status updated successfully' });
        }
    );
});

app.get('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
    db.all('SELECT * FROM products ORDER BY id', (err, products) => {
        if (err) {
            console.error('Database error in admin products:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

app.post('/api/admin/products', authenticateToken, requireAdmin, (req, res) => {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    db.run(
        'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, image, category, stock || 0],
        function(err) {
            if (err) {
                console.error('Database error in add product:', err);
                return res.status(500).json({ message: 'Error creating product' });
            }

            res.status(201).json({
                message: 'Product created successfully',
                productId: this.lastID
            });
        }
    );
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    db.run(
        `UPDATE products 
         SET name = ?, description = ?, price = ?, image = ?, category = ?, stock = ?
         WHERE id = ?`,
        [name, description, price, image, category, stock, id],
        function(err) {
            if (err) {
                console.error('Database error in update product:', err);
                return res.status(500).json({ message: 'Error updating product' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product updated successfully' });
        }
    );
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Database error in delete product:', err);
            return res.status(500).json({ message: 'Error deleting product' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    });
});

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
    const stats = {};

    // Get total orders
    db.get('SELECT COUNT(*) as totalOrders FROM orders', (err, row) => {
        if (err) {
            console.error('Database error in stats - orders:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        stats.totalOrders = row.totalOrders;

        // Get total products
        db.get('SELECT COUNT(*) as totalProducts FROM products', (err, row) => {
            if (err) {
                console.error('Database error in stats - products:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            
            stats.totalProducts = row.totalProducts;

            // Get pending orders
            db.get('SELECT COUNT(*) as pendingOrders FROM orders WHERE status = "pending"', (err, row) => {
                if (err) {
                    console.error('Database error in stats - pending orders:', err);
                    return res.status(500).json({ message: 'Database error' });
                }
                
                stats.pendingOrders = row.pendingOrders;

                // Get total revenue
                db.get('SELECT SUM(total_amount) as totalRevenue FROM orders WHERE status = "completed"', (err, row) => {
                    if (err) {
                        console.error('Database error in stats - revenue:', err);
                        return res.status(500).json({ message: 'Database error' });
                    }
                    
                    stats.totalRevenue = row.totalRevenue || 0;
                    res.json(stats);
                });
            });
        });
    });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Velvet Vogue server running on http://localhost:${PORT}`);
    console.log(`📊 Admin login: admin@velvetvogue.com / admin123`);
    console.log(`👤 Demo user login: user@example.com / user123`);
});