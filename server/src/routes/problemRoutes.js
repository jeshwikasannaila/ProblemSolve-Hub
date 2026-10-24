const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Helper to generate a URL-safe slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * @route   GET /api/problems
 * @desc    Get all problems with optional search, category, difficulty, and sort filters
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const { search = '', category = 'ALL', difficulty = 'ALL', sort = 'newest', status = 'ALL' } = req.query;

    let query = `
      SELECT 
        p.id, p.title, p.slug, p.description, p.category, p.difficulty, 
        p.requirements, p.tags, p.reward_amount, p.deadline, p.status, p.created_at,
        u.id as customer_id, u.name as customer_name, u.company_name, u.avatar as customer_avatar, u.is_verified,
        (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id) as submission_count
      FROM problems p
      JOIN users u ON p.customer_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by search keyword
    if (search && search.trim()) {
      query += ` AND (LOWER(p.title) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.tags) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    // Filter by category
    if (category && category !== 'ALL') {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'ALL') {
      query += ` AND p.difficulty = ?`;
      params.push(difficulty);
    }

    // Filter by status (default to ACTIVE unless explicitly requested)
    if (status && status !== 'ALL') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    // Sorting
    switch (sort) {
      case 'reward_desc':
        query += ` ORDER BY p.reward_amount DESC`;
        break;
      case 'reward_asc':
        query += ` ORDER BY p.reward_amount ASC`;
        break;
      case 'deadline_asc':
        query += ` ORDER BY p.deadline ASC`;
        break;
      case 'most_submissions':
        query += ` ORDER BY submission_count DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY p.created_at DESC`;
        break;
    }

    const problems = db.prepare(query).all(...params);

    const formatted = problems.map(prob => ({
      ...prob,
      tags: JSON.parse(prob.tags || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems: ' + error.message });
  }
});

/**
 * @route   GET /api/problems/featured
 * @desc    Get top featured active problems for landing page
 * @access  Public
 */
router.get('/featured', (req, res) => {
  try {
    const problems = db.prepare(`
      SELECT 
        p.id, p.title, p.slug, p.description, p.category, p.difficulty, 
        p.tags, p.reward_amount, p.deadline, p.status, p.created_at,
        u.name as customer_name, u.company_name, u.avatar as customer_avatar, u.is_verified,
        (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id) as submission_count
      FROM problems p
      JOIN users u ON p.customer_id = u.id
      WHERE p.status = 'ACTIVE'
      ORDER BY p.reward_amount DESC
      LIMIT 6
    `).all();

    const formatted = problems.map(prob => ({
      ...prob,
      tags: JSON.parse(prob.tags || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/problems/customer/mine
 * @desc    Get all problems posted by the logged-in customer
 * @access  Private (CUSTOMER, ADMIN)
 */
router.get('/customer/mine', authenticate, authorize('CUSTOMER', 'ADMIN'), (req, res) => {
  try {
    const problems = db.prepare(`
      SELECT 
        p.id, p.title, p.slug, p.description, p.category, p.difficulty, 
        p.requirements, p.tags, p.reward_amount, p.deadline, p.status, p.created_at,
        (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id) as submission_count,
        (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id AND s.is_winner = 1) as has_winner
      FROM problems p
      WHERE p.customer_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.id);

    const formatted = problems.map(prob => ({
      ...prob,
      tags: JSON.parse(prob.tags || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer problems: ' + error.message });
  }
});

/**
 * @route   GET /api/problems/:id
 * @desc    Get a single problem by ID or slug
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const isNumeric = !isNaN(Number(req.params.id));
    const query = isNumeric 
      ? `WHERE p.id = ? OR p.slug = ?`
      : `WHERE p.slug = ?`;
    const params = isNumeric ? [Number(req.params.id), req.params.id] : [req.params.id];

    const problem = db.prepare(`
      SELECT 
        p.*,
        u.id as customer_id, u.name as customer_name, u.company_name, u.avatar as customer_avatar, u.is_verified,
        (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id) as submission_count
      FROM problems p
      JOIN users u ON p.customer_id = u.id
      ${query}
    `).get(...params);

    if (!problem) {
      return res.status(404).json({ error: 'Problem statement not found.' });
    }

    res.json({
      ...problem,
      tags: JSON.parse(problem.tags || '[]')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/problems
 * @desc    Create a new problem statement with virtual escrow lock
 * @access  Private (CUSTOMER, ADMIN)
 */
router.post('/', authenticate, authorize('CUSTOMER', 'ADMIN'), (req, res) => {
  try {
    const { title, description, category, difficulty = 'Intermediate', requirements = '', tags = [], rewardAmount, deadline } = req.body;

    // 1. Validation
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: 'Problem title must be at least 5 characters long.' });
    }
    if (!description || description.trim().length < 20) {
      return res.status(400).json({ error: 'Problem description must be at least 20 characters long.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Please select a technical category for this challenge.' });
    }
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be Beginner, Intermediate, or Advanced.' });
    }

    const rewardNum = parseFloat(rewardAmount);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      return res.status(400).json({ error: 'Reward bounty amount must be a positive number greater than 0.' });
    }

    if (!deadline) {
      return res.status(400).json({ error: 'A submission deadline date and time is required.' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ error: 'Invalid deadline date format.' });
    }

    const now = new Date();
    if (deadlineDate <= now) {
      return res.status(400).json({ error: 'Deadline must be set to a future date and time.' });
    }

    // 2. Virtual Escrow Balance Check
    const currentUser = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(req.user.id);
    if (!currentUser || currentUser.wallet_balance < rewardNum) {
      return res.status(400).json({
        error: `Insufficient virtual wallet balance. You have $${Number(currentUser?.wallet_balance || 0).toLocaleString()} available, but this challenge requires $${rewardNum.toLocaleString()}. Please reduce the bounty amount or deposit virtual funds.`
      });
    }

    // 3. Generate unique slug
    const baseSlug = slugify(title);
    const uniqueSuffix = Date.now().toString(36);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    // Normalize tags array
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // 4. Atomic Database Transaction: Deduct Escrow + Insert Problem + Record Transaction
    db.exec('BEGIN TRANSACTION;');
    try {
      // Deduct reward from customer wallet
      db.prepare(`
        UPDATE users
        SET wallet_balance = wallet_balance - ?
        WHERE id = ?
      `).run(rewardNum, req.user.id);

      // Insert problem
      const insertProblemStmt = db.prepare(`
        INSERT INTO problems (
          title, slug, description, category, difficulty, requirements, tags, reward_amount, deadline, status, customer_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const problemResult = insertProblemStmt.run(
        title.trim(),
        slug,
        description.trim(),
        category.trim(),
        difficulty,
        requirements ? requirements.trim() : '',
        JSON.stringify(tagsArray),
        rewardNum,
        deadlineDate.toISOString(),
        'ACTIVE',
        req.user.id
      );

      const problemId = problemResult.lastInsertRowid;

      // Record Escrow transaction in ledger
      db.prepare(`
        INSERT INTO transactions (from_user_id, to_user_id, problem_id, amount, type, description)
        VALUES (?, NULL, ?, ?, 'ESCROW_LOCK', ?)
      `).run(
        req.user.id,
        problemId,
        rewardNum,
        `Virtual escrow lock of $${rewardNum.toLocaleString()} for challenge: "${title.trim()}"`
      );

      db.exec('COMMIT;');

      // Fetch fresh updated user and problem
      const freshUser = db.prepare('SELECT id, wallet_balance FROM users WHERE id = ?').get(req.user.id);
      const createdProblem = db.prepare(`
        SELECT p.*, u.name as customer_name, u.company_name, u.avatar as customer_avatar
        FROM problems p
        JOIN users u ON p.customer_id = u.id
        WHERE p.id = ?
      `).get(problemId);

      res.status(201).json({
        message: 'Problem statement published successfully! Reward held in escrow.',
        problem: {
          ...createdProblem,
          tags: JSON.parse(createdProblem.tags || '[]')
        },
        newWalletBalance: freshUser.wallet_balance
      });
    } catch (txError) {
      db.exec('ROLLBACK;');
      throw txError;
    }
  } catch (error) {
    console.error('Problem creation error:', error);
    res.status(500).json({ error: 'Failed to publish problem statement: ' + error.message });
  }
});

/**
 * @route   PUT /api/problems/:id
 * @desc    Edit an existing problem (Owner or Admin only)
 * @access  Private (CUSTOMER, ADMIN)
 */
router.put('/:id', authenticate, authorize('CUSTOMER', 'ADMIN'), (req, res) => {
  try {
    const problemId = Number(req.params.id);
    const { title, description, category, difficulty, requirements, tags, deadline } = req.body;

    // 1. Check if problem exists
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem statement not found.' });
    }

    // 2. Ownership security check
    if (problem.customer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied. You can only edit problems that you created.' });
    }

    // 3. Completed check
    if (problem.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot modify a challenge that has already been awarded and completed.' });
    }

    // 4. Validate updates
    const updatedTitle = title && title.trim().length >= 5 ? title.trim() : problem.title;
    const updatedDesc = description && description.trim().length >= 20 ? description.trim() : problem.description;
    const updatedCat = category && category.trim() ? category.trim() : problem.category;
    const updatedDiff = ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty) ? difficulty : problem.difficulty;
    const updatedReqs = requirements !== undefined ? requirements.trim() : problem.requirements;

    let updatedTags = problem.tags;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updatedTags = JSON.stringify(tags.map(t => String(t).trim()).filter(Boolean));
      } else if (typeof tags === 'string') {
        updatedTags = JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean));
      }
    }

    let updatedDeadline = problem.deadline;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({ error: 'Invalid deadline date format.' });
      }
      if (deadlineDate <= new Date() && problem.status === 'ACTIVE') {
        return res.status(400).json({ error: 'New deadline must be in the future.' });
      }
      updatedDeadline = deadlineDate.toISOString();
    }

    // 5. Update SQLite record
    db.prepare(`
      UPDATE problems
      SET title = ?, description = ?, category = ?, difficulty = ?, requirements = ?, tags = ?, deadline = ?
      WHERE id = ?
    `).run(updatedTitle, updatedDesc, updatedCat, updatedDiff, updatedReqs, updatedTags, updatedDeadline, problemId);

    const updatedProblem = db.prepare(`
      SELECT p.*, u.name as customer_name, u.company_name, u.avatar as customer_avatar
      FROM problems p
      JOIN users u ON p.customer_id = u.id
      WHERE p.id = ?
    `).get(problemId);

    res.json({
      message: 'Problem statement updated successfully!',
      problem: {
        ...updatedProblem,
        tags: JSON.parse(updatedProblem.tags || '[]')
      }
    });
  } catch (error) {
    console.error('Problem update error:', error);
    res.status(500).json({ error: 'Failed to update problem statement: ' + error.message });
  }
});

module.exports = router;
