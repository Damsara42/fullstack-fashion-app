const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./database.db');

// Get all orders
router.get('/orders', (req, res) => {
    db.all(
        `SELECT o.*, u.name as user_name, u.email as user_email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC`,
        (err, orders) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }

            // Parse order details
            orders.forEach(order => {
                order.order_details = JSON.parse(order.order_details);
            });

            res.json(orders);
        }
    );
});

// Update order status
router.put('/orders/:id', (req, res) => {
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
                return res.status(500).json({ message: 'Database error' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }

            res.json({ message: 'Order status updated successfully' });
        }
    );
});

// Get all products
router.get('/products', (req, res) => {
    db.all('SELECT * FROM products ORDER BY id', (err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

// Add new product
router.post('/products', (req, res) => {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    db.run(
        'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, image, category, stock || 0],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error creating product' });
            }

            res.status(201).json({
                message: 'Product created successfully',
                productId: this.lastID
            });
        }
    );
});

// Update product
router.put('/products/:id', (req, res) => {
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
                return res.status(500).json({ message: 'Error updating product' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json({ message: 'Product updated successfully' });
        }
    );
});

// Delete product
router.delete('/products/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting product' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;