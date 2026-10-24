const express = require('express');
const db = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

const router = express.Router();

/**
 * @route   GET /api/certificates/:code
 * @desc    Public verification endpoint for looking up a certificate by code
 * @access  Public
 */
router.get('/:code', (req, res) => {
  try {
    const certCode = req.params.code?.trim();
    if (!certCode) {
      return res.status(400).json({ error: 'Certificate code is required.' });
    }

    const cert = db.prepare(`
      SELECT 
        c.id, c.certificate_code, c.award_title, c.issue_date, c.developer_id, c.customer_id,
        p.id as problem_id, p.title as problem_title, p.reward_amount,
        dev.name as developer_name, dev.avatar as developer_avatar, dev.email as developer_email,
        cust.name as customer_name, cust.company_name,
        r.rating, r.feedback as customer_review
      FROM certificates c
      JOIN problems p ON c.problem_id = p.id
      JOIN users dev ON c.developer_id = dev.id
      JOIN users cust ON c.customer_id = cust.id
      LEFT JOIN reviews r ON c.problem_id = r.problem_id AND c.developer_id = r.developer_id
      WHERE UPPER(c.certificate_code) = UPPER(?)
    `).get(certCode);

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found. Please verify the certificate code.' });
    }

    res.json(cert);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Failed to retrieve certificate: ' + error.message });
  }
});

/**
 * @route   GET /api/certificates/:code/pdf
 * @desc    Generate and download genuine PDF for a verified certificate.
 *          Enforces requirement 6: Only allows developers to download their own certificates (or issuing customer / admin).
 * @access  Private (Authenticated)
 */
router.get('/:code/pdf', authenticate, (req, res) => {
  try {
    const certCode = req.params.code?.trim();
    if (!certCode) {
      return res.status(400).json({ error: 'Certificate code is required.' });
    }

    const cert = db.prepare(`
      SELECT 
        c.id, c.certificate_code, c.award_title, c.issue_date, c.developer_id, c.customer_id,
        p.id as problem_id, p.title as problem_title, p.reward_amount,
        dev.name as developer_name, dev.email as developer_email,
        cust.name as customer_name, cust.company_name,
        r.rating, r.feedback as customer_review
      FROM certificates c
      JOIN problems p ON c.problem_id = p.id
      JOIN users dev ON c.developer_id = dev.id
      JOIN users cust ON c.customer_id = cust.id
      LEFT JOIN reviews r ON c.problem_id = r.problem_id AND c.developer_id = r.developer_id
      WHERE UPPER(c.certificate_code) = UPPER(?)
    `).get(certCode);

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found. Please verify the certificate code.' });
    }

    // Requirement 6: Allow developers to download only certificates belonging to their own awarded submissions
    const isWinningDeveloper = req.user.id === cert.developer_id;
    const isIssuingCustomer = req.user.id === cert.customer_id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isWinningDeveloper && !isIssuingCustomer && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied: You can only download official certificate PDFs for your own awarded submissions.'
      });
    }

    // Set genuine PDF response headers
    const sanitizedFilename = `ProblemSolveHub-Certificate-${cert.certificate_code}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);

    // Stream PDF into response
    generateCertificatePDF(cert, res);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate certificate PDF: ' + error.message });
    }
  }
});

module.exports = router;
