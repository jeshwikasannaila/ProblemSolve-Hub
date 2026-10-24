const express = require('express');
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Helper to generate a unique certificate verification code
 * e.g. PSH-2026-X8K9M2
 */
function generateCertificateCode() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timeChars = Date.now().toString(36).slice(-4).toUpperCase();
  return `PSH-${year}-${randomChars}${timeChars}`;
}

/**
 * @route   POST /api/submissions
 * @desc    Submit a solution to an active problem
 * @access  Private (Developers only)
 */
router.post('/', authenticate, authorize('DEVELOPER', 'ADMIN'), (req, res) => {
  try {
    const { problem_id, title, description, repo_url, demo_url } = req.body;

    if (!problem_id) {
      return res.status(400).json({ error: 'Problem ID is required.' });
    }

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: 'Solution title must be at least 5 characters.' });
    }

    if (!description || description.trim().length < 20) {
      return res.status(400).json({ error: 'Solution description must be at least 20 characters explaining your approach.' });
    }

    if (!repo_url || !/^https?:\/\/.+/i.test(repo_url.trim())) {
      return res.status(400).json({ error: 'A valid GitHub or source repository URL starting with http:// or https:// is required.' });
    }

    if (demo_url && demo_url.trim() && !/^https?:\/\/.+/i.test(demo_url.trim())) {
      return res.status(400).json({ error: 'Live demo URL must start with http:// or https://' });
    }

    // Verify problem exists and is active
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problem_id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem statement not found.' });
    }

    if (problem.status !== 'ACTIVE') {
      return res.status(400).json({ error: `Cannot submit to this problem because it is currently ${problem.status}.` });
    }

    // Check deadline
    if (new Date(problem.deadline) <= new Date()) {
      return res.status(400).json({ error: 'Submissions are closed for this problem because the deadline has passed.' });
    }

    // Customer cannot submit to their own problem
    if (problem.customer_id === req.user.id) {
      return res.status(403).json({ error: 'You cannot submit solutions to challenges that you posted.' });
    }

    // Check if developer has already submitted to this problem (Rule 8: prevent duplicate submissions)
    const existing = db.prepare('SELECT id, status FROM submissions WHERE problem_id = ? AND developer_id = ?').get(problem_id, req.user.id);
    if (existing) {
      return res.status(400).json({
        error: 'You have already submitted a solution for this problem. Duplicate submissions are not allowed.',
        existingSubmissionId: existing.id
      });
    }

    // Insert submission
    const insertSub = db.prepare(`
      INSERT INTO submissions (problem_id, developer_id, title, description, repo_url, demo_url, status, is_winner)
      VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', 0)
    `);

    const result = insertSub.run(
      problem.id,
      req.user.id,
      title.trim(),
      description.trim(),
      repo_url.trim(),
      demo_url ? demo_url.trim() : '',
    );

    const newSubmission = db.prepare(`
      SELECT s.*, p.title as problem_title, p.reward_amount
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Solution submitted successfully! The customer will review your submission.',
      submission: newSubmission
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ error: 'Failed to submit solution: ' + error.message });
  }
});

/**
 * @route   GET /api/submissions/developer/mine
 * @desc    Get all submissions by the logged-in developer
 * @access  Private (Developers only)
 */
router.get('/developer/mine', authenticate, authorize('DEVELOPER', 'ADMIN'), (req, res) => {
  try {
    const submissions = db.prepare(`
      SELECT 
        s.id, s.problem_id, s.developer_id, s.title, s.description,
        s.repo_url, s.demo_url, s.status, s.is_winner, s.reviewer_notes, s.submitted_at, s.updated_at,
        p.title as problem_title, p.slug as problem_slug, p.category, p.difficulty, p.reward_amount, p.status as problem_status, p.deadline,
        u.name as customer_name, u.company_name, u.avatar as customer_avatar,
        c.certificate_code,
        r.rating as customer_rating, r.feedback as customer_feedback
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      JOIN users u ON p.customer_id = u.id
      LEFT JOIN certificates c ON s.id = c.submission_id
      LEFT JOIN reviews r ON s.id = r.submission_id
      WHERE s.developer_id = ?
      ORDER BY s.submitted_at DESC
    `).all(req.user.id);

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching developer submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions: ' + error.message });
  }
});

/**
 * @route   GET /api/submissions/problem/:problemId
 * @desc    Get submissions for a specific problem
 *          If customer/admin: gets ALL submissions with developer details
 *          If developer: gets ONLY their own submission for this problem
 * @access  Private
 */
router.get('/problem/:problemId', authenticate, (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId, 10);
    if (!problemId) {
      return res.status(400).json({ error: 'Valid Problem ID is required.' });
    }

    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const isCustomerOwner = problem.customer_id === req.user.id || req.user.role === 'ADMIN';

    if (isCustomerOwner) {
      // Return ALL submissions with full developer profiles
      const submissions = db.prepare(`
        SELECT 
          s.id, s.problem_id, s.developer_id, s.title, s.description, s.repo_url, s.demo_url,
          s.status, s.is_winner, s.reviewer_notes, s.submitted_at,
          dev.name as developer_name, dev.avatar as developer_avatar, dev.skills as developer_skills, dev.bio as developer_bio, dev.email as developer_email,
          c.certificate_code,
          r.rating, r.feedback as review_feedback
        FROM submissions s
        JOIN users dev ON s.developer_id = dev.id
        LEFT JOIN certificates c ON s.id = c.submission_id
        LEFT JOIN reviews r ON s.id = r.submission_id
        WHERE s.problem_id = ?
        ORDER BY s.is_winner DESC, s.submitted_at ASC
      `).all(problemId);

      const formatted = submissions.map(sub => ({
        ...sub,
        developer_skills: JSON.parse(sub.developer_skills || '[]')
      }));

      return res.json({
        isOwner: true,
        submissions: formatted
      });
    } else {
      // Developer: return only their own submission (if any)
      const mySubmissions = db.prepare(`
        SELECT 
          s.id, s.problem_id, s.developer_id, s.title, s.description, s.repo_url, s.demo_url,
          s.status, s.is_winner, s.reviewer_notes, s.submitted_at,
          c.certificate_code,
          r.rating, r.feedback as review_feedback
        FROM submissions s
        LEFT JOIN certificates c ON s.id = c.submission_id
        LEFT JOIN reviews r ON s.id = r.submission_id
        WHERE s.problem_id = ? AND s.developer_id = ?
      `).all(problemId, req.user.id);

      return res.json({
        isOwner: false,
        submissions: mySubmissions
      });
    }
  } catch (error) {
    console.error('Error fetching problem submissions:', error);
    res.status(500).json({ error: 'Failed to fetch problem submissions: ' + error.message });
  }
});

/**
 * @route   POST /api/submissions/:id/select-winner
 * @desc    Select exactly one winner for a problem, transfer escrow bounty,
 *          mint verified certificate, and record customer rating.
 * @access  Private (Problem Customer owner or Admin)
 */
router.post('/:id/select-winner', authenticate, authorize('CUSTOMER', 'ADMIN'), (req, res) => {
  const submissionId = parseInt(req.params.id, 10);
  const { rating = 5, feedback = '' } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: 'Valid submission ID is required.' });
  }

  // Fetch submission and associated problem
  const submission = db.prepare(`
    SELECT 
      s.id, s.problem_id, s.developer_id, s.title as submission_title, s.status as submission_status, s.is_winner,
      p.id as problem_id, p.title as problem_title, p.customer_id, p.reward_amount, p.status as problem_status, p.winner_submission_id,
      dev.name as developer_name, dev.email as developer_email, dev.wallet_balance as dev_wallet
    FROM submissions s
    JOIN problems p ON s.problem_id = p.id
    JOIN users dev ON s.developer_id = dev.id
    WHERE s.id = ?
  `).get(submissionId);

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  // Enforce customer ownership or admin role (Rule 9)
  if (submission.customer_id !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized: You can only select winners for challenges that you posted.' });
  }

  // Prevent multiple winners according to project rules (Rule 5 & Rule 8)
  if (submission.winner_submission_id || submission.problem_status === 'COMPLETED') {
    return res.status(400).json({ error: 'This problem already has an awarded winner and is marked as Completed.' });
  }

  if (submission.is_winner || submission.submission_status === 'WINNER') {
    return res.status(400).json({ error: 'This submission has already been awarded as the winner.' });
  }

  // Validate rating if provided
  const ratingNum = parseInt(rating, 10);
  const finalRating = (ratingNum >= 1 && ratingNum <= 5) ? ratingNum : 5;
  const finalFeedback = feedback && feedback.trim() ? feedback.trim() : 'Outstanding solution that met all core specifications!';

  // Generate unique certificate verification code
  let certCode = generateCertificateCode();
  let codeCollision = db.prepare('SELECT id FROM certificates WHERE certificate_code = ?').get(certCode);
  while (codeCollision) {
    certCode = generateCertificateCode();
    codeCollision = db.prepare('SELECT id FROM certificates WHERE certificate_code = ?').get(certCode);
  }

  // Safe Atomic Database Transaction (Rule 6)
  try {
    db.exec('BEGIN TRANSACTION');

    // 1. Mark problem as COMPLETED and record winner_submission_id
    db.prepare(`
      UPDATE problems 
      SET status = 'COMPLETED', winner_submission_id = ? 
      WHERE id = ?
    `).run(submission.id, submission.problem_id);

    // 2. Mark this submission as WINNER
    db.prepare(`
      UPDATE submissions 
      SET status = 'WINNER', is_winner = 1, reviewer_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(finalFeedback, submission.id);

    // 3. Mark all other submissions for this problem as REJECTED
    db.prepare(`
      UPDATE submissions 
      SET status = 'REJECTED', is_winner = 0, updated_at = CURRENT_TIMESTAMP
      WHERE problem_id = ? AND id != ?
    `).run(submission.problem_id, submission.id);

    // 4. Transfer the virtual escrow reward to the winning developer's wallet
    db.prepare(`
      UPDATE users 
      SET wallet_balance = wallet_balance + ? 
      WHERE id = ?
    `).run(submission.reward_amount, submission.developer_id);

    // 5. Record REWARD_PAYOUT in transactions table
    db.prepare(`
      INSERT INTO transactions (from_user_id, to_user_id, problem_id, amount, type, description)
      VALUES (?, ?, ?, ?, 'REWARD_PAYOUT', ?)
    `).run(
      submission.customer_id,
      submission.developer_id,
      submission.problem_id,
      submission.reward_amount,
      `Bounty reward payout for "${submission.problem_title}" awarded to ${submission.developer_name}`
    );

    // 6. Generate official Certificate record
    const insertCert = db.prepare(`
      INSERT INTO certificates (certificate_code, problem_id, submission_id, developer_id, customer_id, award_title, issue_date)
      VALUES (?, ?, ?, ?, ?, '1st Place Winner & Best Solution', CURRENT_TIMESTAMP)
    `);
    const certResult = insertCert.run(
      certCode,
      submission.problem_id,
      submission.id,
      submission.developer_id,
      submission.customer_id
    );

    // 7. Record Customer Review and Rating
    db.prepare(`
      INSERT INTO reviews (problem_id, submission_id, developer_id, customer_id, rating, feedback)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      submission.problem_id,
      submission.id,
      submission.developer_id,
      submission.customer_id,
      finalRating,
      finalFeedback
    );

    db.exec('COMMIT');

    res.json({
      success: true,
      message: `Winner selected! $${submission.reward_amount.toLocaleString()} bounty successfully transferred to ${submission.developer_name}'s wallet.`,
      certificate_code: certCode,
      reward_amount: submission.reward_amount,
      winner_name: submission.developer_name,
      problem_id: submission.problem_id,
      submission_id: submission.id
    });
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch (rbErr) {
      console.error('Rollback error:', rbErr);
    }
    console.error('Error during select-winner transaction:', err);
    res.status(500).json({ error: 'Failed to process winner selection: ' + err.message });
  }
});

module.exports = router;
