import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    [, token] = req.headers.authorization.split(' ');
  }

  if (!token) {
    res.status(401);
    res.json({ message: 'Not authorized, token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      res.json({ message: 'Not authorized, user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    res.json({ message: 'Not authorized, token invalid' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    res.json({ message: 'Not authorized' });
    return;
  }

  if (!roles.includes(req.user.role)) {
    res.status(403);
    res.json({ message: 'Forbidden: insufficient role' });
    return;
  }

  next();
};

