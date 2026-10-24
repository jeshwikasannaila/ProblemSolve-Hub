const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Customer, Developer, or Admin)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'DEVELOPER', companyName = '' } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedRole = role.toUpperCase();
    if (!['CUSTOMER', 'DEVELOPER', 'ADMIN'].includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid user role selected. Must be CUSTOMER, DEVELOPER, or ADMIN.' });
    }

    if (normalizedRole === 'CUSTOMER' && companyName && !companyName.trim()) {
      return res.status(400).json({ error: 'Company name cannot be blank for customer accounts.' });
    }

    // 2. Check for duplicate email (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    // 3. Hash password securely with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Initial virtual wallet balance ($1,000 for customers to post bounties, $0 or $100 bonus for solvers)
    const initialBalance = normalizedRole === 'CUSTOMER' ? 1000.0 : 0.0;
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=0f172a,1e293b,10b981`;

    // 4. Insert into SQLite database
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password, role, company_name, wallet_balance, avatar, skills, is_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name.trim(),
      normalizedEmail,
      passwordHash,
      normalizedRole,
      companyName ? companyName.trim() : '',
      initialBalance,
      avatar,
      JSON.stringify([]),
      0,
      'ACTIVE'
    );

    const newUserId = result.lastInsertRowid;

    // 5. Fetch newly created user record (excluding password)
    const newUser = db.prepare(`
      SELECT id, name, email, role, bio, company_name, skills, wallet_balance, avatar, is_verified, created_at
      FROM users
      WHERE id = ?
    `).get(newUserId);

    const safeUser = {
      ...newUser,
      skills: JSON.parse(newUser.skills || '[]')
    };

    // 6. Sign JWT
    const token = generateToken(safeUser);

    res.status(201).json({
      message: 'Account registered successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. ' + error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user in database
    const user = db.prepare(`
      SELECT id, name, email, password, role, bio, company_name, skills, wallet_balance, avatar, is_verified, status, created_at
      FROM users
      WHERE LOWER(email) = ?
    `).get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // 2. Check account status
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact platform administration.' });
    }

    // 3. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    // 4. Safe user object (omit password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      company_name: user.company_name,
      skills: JSON.parse(user.skills || '[]'),
      wallet_balance: user.wallet_balance,
      avatar: user.avatar,
      is_verified: user.is_verified,
      created_at: user.created_at
    };

    // 5. Generate token
    const token = generateToken(safeUser);

    res.json({
      message: 'Signed in successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in. ' + error.message });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user profile
 * @access  Private
 */
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, bio, company_name, skills, avatar } = req.body;
    const userId = req.user.id;

    const updatedName = name && name.trim() ? name.trim() : req.user.name;
    const updatedBio = bio !== undefined ? bio.trim() : req.user.bio;
    const updatedCompany = company_name !== undefined ? company_name.trim() : req.user.company_name;
    const updatedSkills = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify(req.user.skills);
    const updatedAvatar = avatar !== undefined ? avatar.trim() : req.user.avatar;

    db.prepare(`
      UPDATE users
      SET name = ?, bio = ?, company_name = ?, skills = ?, avatar = ?
      WHERE id = ?
    `).run(updatedName, updatedBio, updatedCompany, updatedSkills, updatedAvatar, userId);

    const freshUser = db.prepare(`
      SELECT id, name, email, role, bio, company_name, skills, wallet_balance, avatar, is_verified, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    res.json({
      message: 'Profile updated successfully!',
      user: {
        ...freshUser,
        skills: JSON.parse(freshUser.skills || '[]')
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile. ' + error.message });
  }
});

module.exports = router;
