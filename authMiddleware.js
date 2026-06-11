const jwt = require('jsonwebtoken');

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return '';
  }

  return authHeader.slice(7);
}

function requireAdminAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only.' });
    }

    req.admin = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin token.' });
  }
}

function requireUserAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Customer authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== 'user') {
      return res.status(403).json({ message: 'Customer access only.' });
    }

    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired customer token.' });
  }
}

function attachUserIfAuthenticated(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role === 'user') {
      req.user = payload;
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired customer token.' });
  }

  return next();
}

module.exports = {
  attachUserIfAuthenticated,
  requireAdminAuth,
  requireUserAuth,
};
