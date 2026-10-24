require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db/database');
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Static uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    res.json({
      status: 'healthy',
      app: 'ProblemSolve Hub API',
      database: 'SQLite (node:sqlite)',
      connected: true,
      userCount: userCount.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Platform overview statistics (for Landing Page & stats widgets)
app.get('/api/stats', (req, res) => {
  try {
    const totalRewards = db.prepare("SELECT COALESCE(SUM(reward_amount), 0) as total FROM problems WHERE status IN ('ACTIVE', 'COMPLETED')").get();
    const activeProblems = db.prepare("SELECT COUNT(*) as count FROM problems WHERE status = 'ACTIVE'").get();
    const completedProblems = db.prepare("SELECT COUNT(*) as count FROM problems WHERE status = 'COMPLETED'").get();
    const totalSolversCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'DEVELOPER'").get();
    const totalCompaniesCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'").get();
    const totalCertificates = db.prepare("SELECT COUNT(*) as count FROM certificates").get();

    res.json({
      totalRewardsDistributed: totalRewards.total,
      activeProblemsCount: activeProblems.count,
      completedProblemsCount: completedProblems.count,
      totalSolversCount: totalSolversCount.count,
      totalCompaniesCount: totalCompaniesCount.count,
      totalCertificatesIssued: totalCertificates.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top solvers leaderboard preview
app.get('/api/leaderboard/preview', (req, res) => {
  try {
    const topSolvers = db.prepare(`
      SELECT 
        u.id, u.name, u.avatar, u.bio, u.skills, u.wallet_balance,
        COUNT(c.id) as wins_count,
        COALESCE(AVG(r.rating), 5.0) as average_rating,
        COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN certificates c ON u.id = c.developer_id
      LEFT JOIN reviews r ON u.id = r.developer_id
      WHERE u.role = 'DEVELOPER'
      GROUP BY u.id
      ORDER BY wins_count DESC, u.wallet_balance DESC
      LIMIT 4
    `).all();

    const formatted = topSolvers.map(s => ({
      ...s,
      skills: JSON.parse(s.skills || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`ProblemSolve Hub backend running on http://localhost:${PORT}`);
});
