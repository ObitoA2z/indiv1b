const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../prisma');
const { signToken } = require('../auth');
const { serializeUser } = require('../utils/serializeUser');

const router = express.Router();
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildLoginThrottleKey(req, email) {
  return `${req.ip || 'unknown'}:${String(email || '').toLowerCase()}`;
}

function checkLoginThrottle(req, email) {
  const key = buildLoginThrottleKey(req, email);
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 0, resetAt: now + LOGIN_WINDOW_MS });
    return { blocked: false, key };
  }

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    return { blocked: true, key };
  }

  return { blocked: false, key };
}

function markLoginFailure(key) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  entry.count += 1;
  loginAttempts.set(key, entry);
}

function clearLoginFailures(key) {
  loginAttempts.delete(key);
}

router.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, address, phone, gender, sellerMessage } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont obligatoires' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Format email invalide' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caracteres' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email deja utilise' });
    }

    const hash = await bcrypt.hash(password, 10);
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : undefined;
    const initialRole = normalizedRole === 'SELLER' ? 'SELLER' : 'BUYER';

    const user = await prisma.user.create({
      data: {
        name: name || email.split('@')[0],
        email,
        password: hash,
        role: initialRole,
        active: true,
        address: address || null,
        phone: phone || null,
        gender: gender || null,
      },
    });

    if (normalizedRole === 'SELLER') {
      await prisma.sellerRequest.upsert({
        where: { userId: user.id },
        update: { status: 'pending', message: sellerMessage || null },
        create: { userId: user.id, status: 'pending', message: sellerMessage || null },
      });
    }

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: serializeUser(user),
      message: 'Votre compte a ete cree avec succes.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont obligatoires' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Format email invalide' });
    }

    const throttle = checkLoginThrottle(req, email);
    if (throttle.blocked) {
      return res.status(429).json({ error: 'Trop de tentatives. Reessayez plus tard.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      markLoginFailure(throttle.key);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      markLoginFailure(throttle.key);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    clearLoginFailures(throttle.key);
    const token = signToken(user);
    return res.json({ token, user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

module.exports = router;
