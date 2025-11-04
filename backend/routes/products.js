const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./database.db');

// Get all products
router.get('/', (req, res) => {
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
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

// Get featured products
router.get('/featured', (req, res) => {
    db.all('SELECT * FROM products WHERE featured = 1 LIMIT 4', (err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

// Get product by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    });
});

// Get products by category
router.get('/category/:category', (req, res) => {
    const { category } = req.params;

    db.all('SELECT * FROM products WHERE category = ?', [category], (err, products) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(products);
    });
});

module.exports = router;