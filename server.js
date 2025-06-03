require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// PostgreSQL pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes

// Register new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) return res.status(400).json({ error: 'Missing username or password' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashed]
    );
    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Login user and return JWT token
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) return res.status(400).json({ error: 'Missing username or password' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add food item
app.post('/food-items', authenticateToken, async (req, res) => {
  const { name, barcode, quantity, expiry_date, image_url } = req.body;
  if (!name || !expiry_date) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const result = await pool.query(
      'INSERT INTO food_items (user_id, name, barcode, quantity, expiry_date, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, name, barcode, quantity || 1, expiry_date, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// List user's food items
app.get('/food-items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM food_items WHERE user_id=$1 ORDER BY expiry_date', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete expired items
app.delete('/food-items/expired', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM food_items WHERE user_id=$1 AND expiry_date < CURRENT_DATE RETURNING *',
      [req.user.id]
    );
    res.json({ deletedCount: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Smart Fridge API listening at http://localhost:${port}`);
});
