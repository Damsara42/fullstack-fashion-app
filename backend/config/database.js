const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

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
        )`);

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_details TEXT,
            total_amount REAL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Insert default admin user
        const bcrypt = require('bcryptjs');
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
            ['Admin User', 'admin@velvetvogue.com', adminPassword, 'admin']);

        // Insert sample user
        const userPassword = bcrypt.hashSync('user123', 10);
        db.run(`INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)`, 
            ['Demo User', 'user@example.com', userPassword]);

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

        sampleProducts.forEach(product => {
            db.run(`INSERT OR IGNORE INTO products (name, description, price, image, category, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [product.name, product.description, product.price, product.image, product.category, product.stock, product.featured]);
        });

        console.log('Database initialized with sample data');
    });
}

module.exports = { db, initializeDatabase };