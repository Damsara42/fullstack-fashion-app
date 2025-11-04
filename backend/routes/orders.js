const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./database.db');

// Create order
router.post('/', (req, res) => {
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

// Get user orders
router.get('/my-orders', (req, res) => {
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

module.exports = router;