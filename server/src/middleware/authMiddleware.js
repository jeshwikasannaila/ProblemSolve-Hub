const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'problemsolve_hub_secure_jwt_secret_key_2026';

/**
 * Middleware to verify JWT token and attach user to request object
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Malformed authorization token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db.prepare(`
      SELECT id, name, email, role, bio, company_name, skills, wallet_balance, avatar, is_verified, status, created_at
      FROM users
      WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User associated with this token no longer exists.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact platform administration.' });
    }

    // Attach parsed skills and clean user object to req
    req.user = {
      ...user,
      skills: JSON.parse(user.skills || '[]')
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

/**
 * Middleware to restrict endpoints to specific user roles
 * Example: authorize('ADMIN'), authorize('CUSTOMER', 'ADMIN')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET
};
