import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const { JWT_SECRET, COOKIE_NAME = 'eg_token' } = process.env;

export function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    ...options,
  });
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = (process.env.COOKIE_SECURE ?? 'false') === 'true';
  res.cookie(process.env.COOKIE_NAME || COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: secure,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(process.env.COOKIE_NAME || COOKIE_NAME, { path: '/' });
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.sub).lean();
    if (!user) return res.status(401).json({ message: 'Invalid session' });

    req.user = {
      id: user._id.toString(),
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}