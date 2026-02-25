import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '365d'
  });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name ||!email || !password) {
    res.status(400).json({ message: 'Name, Email and password are required' });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'User with this email already exists' });
    return;
  }

  const userRole =
    role && ['admin', 'faculty', 'student'].includes(role) ? role : 'student';

  const derivedName =
    (typeof name === 'string' && name.trim()) ||
    (typeof email === 'string' ? email.split('@')[0] : 'User');

  const user = await User.create({
    name: derivedName,
    email,
    password,
    role: userRole
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user._id, user.role);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

