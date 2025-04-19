const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'bK5IATaR6H8fNv5z';

// Initialize SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            coins INTEGER DEFAULT 100,
            level INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create items table
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            effect TEXT NOT NULL
        )`);

        // Create inventory table
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            user_id INTEGER NOT NULL,
            item_id TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(item_id) REFERENCES items(id),
            PRIMARY KEY(user_id, item_id)
        )`);

        // Insert default items if they don't exist
        const defaultItems = [
            { id: 'nitro', name: 'Nitro Boost', price: 100, effect: 'speed_boost' },
            { id: 'speed', name: 'Speed Upgrade', price: 500, effect: 'permanent_speed' },
            { id: 'shield', name: 'Shield', price: 200, effect: 'collision_protection' }
        ];

        defaultItems.forEach(item => {
            db.get('SELECT id FROM items WHERE id = ?', [item.id], (err, row) => {
                if (!row) {
                    db.run('INSERT INTO items (id, name, price, effect) VALUES (?, ?, ?, ?)', 
                        [item.id, item.name, item.price, item.effect]);
                }
            });
        });

        // Create a test user if none exists
        db.get('SELECT id FROM users WHERE username = ?', ['test'], (err, row) => {
            if (!row) {
                const hashedPassword = bcrypt.hashSync('password', 10);
                db.run('INSERT INTO users (username, email, password, coins) VALUES (?, ?, ?, ?)', 
                    ['test', 'test@example.com', hashedPassword, 1000]);
            }
        });
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Auth Routes
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if user exists
        db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            if (row) {
                return res.status(400).json({ message: 'User already exists' });
            }
            
            // Hash password and create user
            const hashedPassword = bcrypt.hashSync(password, 10);
            db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                [username, email, hashedPassword], function(err) {
                    if (err) {
                        return res.status(500).json({ message: 'Registration failed' });
                    }
                    
                    // Create JWT token
                    const token = jwt.sign(
                        { id: this.lastID, username },
                        SECRET_KEY,
                        { expiresIn: '24h' }
                    );
                    
                    res.json({ 
                        token,
                        user: { 
                            id: this.lastID, 
                            username, 
                            email, 
                            coins: 100,
                            level: 1 
                        } 
                    });
                });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }
        
        // Find user
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Database error' });
            }
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            // Check password
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET_KEY,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                token,
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email, 
                    coins: user.coins,
                    level: user.level 
                } 
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Protected Routes
app.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

app.get('/profile', (req, res) => {
    db.get('SELECT id, username, email, coins, level FROM users WHERE id = ?', 
        [req.userId], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        });
});

app.post('/purchase', (req, res) => {
    const { itemId } = req.body;
    
    // First get item price
    db.get('SELECT price FROM items WHERE id = ?', [itemId], (err, item) => {
        if (err || !item) {
            return res.status(400).json({ message: 'Invalid item' });
        }
        
        // Check user balance
        db.get('SELECT coins FROM users WHERE id = ?', [req.userId], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            if (user.coins < item.price) {
                return res.status(400).json({ message: 'Not enough coins' });
            }
            
            // Deduct coins and add to inventory
            db.serialize(() => {
                db.run('UPDATE users SET coins = coins - ? WHERE id = ?', 
                    [item.price, req.userId]);
                
                db.run(`INSERT INTO inventory (user_id, item_id) 
                    VALUES (?, ?) ON CONFLICT(user_id, item_id) 
                    DO UPDATE SET quantity = quantity + 1`, 
                    [req.userId, itemId]);
            });
            
            // Return updated user
            db.get('SELECT id, username, email, coins, level FROM users WHERE id = ?', 
                [req.userId], (err, updatedUser) => {
                    res.json({ 
                        message: 'Purchase successful',
                        user: updatedUser 
                    });
                });
        });
    });
});

app.get('/items', (req, res) => {
    db.all('SELECT id, name, price, effect FROM items', [], (err, items) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(items);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
