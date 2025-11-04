const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key_here';

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
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
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
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

// Get current user
router.get('/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    });
});

module.exports = router;