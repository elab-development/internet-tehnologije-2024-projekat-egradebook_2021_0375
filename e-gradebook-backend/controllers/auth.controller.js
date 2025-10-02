import bcrypt from 'bcryptjs';
import { User, ROLES } from '../models/User.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '../middleware/auth.js';

function toPublicUser(u) {
  return {
    id: u._id?.toString?.() ?? u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    classLabel: u.classLabel,
  };
}

export async function register(req, res) {
  try {
    const {
      fullName,
      email,
      password,
      role = 'student',
      classLabel = null,
    } = req.body || {};

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'fullName, email i password su obavezni.' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Nepoznata uloga.' });
    }
    if (role === 'admin') {
      return res.status(403).json({
        message: 'Kreiranje admin naloga nije dozvoljeno preko ove rute.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'Email je već registrovan.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      classLabel,
    });

    const token = signToken({ sub: user._id.toString(), role: user.role });
    setAuthCookie(res, token);

    return res
      .status(201)
      .json({ message: 'Registration successful', user: toPublicUser(user) });
  } catch (err) {
    console.error('REGISTER_ERROR', err);
    return res
      .status(500)
      .json({ message: 'Server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email i password su obavezni.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ sub: user._id.toString(), role: user.role });
    setAuthCookie(res, token);

    return res.json({ message: 'Login successful', user: toPublicUser(user) });
  } catch (err) {
    console.error('LOGIN_ERROR', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

export async function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
}

export async function me(req, res) {
  return res.json({ message: 'Authenticated', user: req.user });
}