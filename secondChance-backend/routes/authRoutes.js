const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../models/db');

const router = express.Router();
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-before-deploy';

function createToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function publicUser(user) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.firstName,
    email: user.email
  };
}

function requireToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter your first name, last name, and a valid email.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const db = await connectToDatabase();
    const users = db.collection('users');
    if (await users.findOne({ email })) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = {
      firstName,
      lastName,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date()
    };
    let result;
    try {
      result = await users.insertOne(user);
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ error: 'An account with that email already exists.' });
      throw error;
    }
    user._id = result.insertedId;

    return res.status(201).json({
      authtoken: createToken(user),
      user: publicUser(user),
      userName: firstName,
      userEmail: email,
      email
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    return res.json({
      authtoken: createToken(user),
      user: publicUser(user),
      userName: user.firstName,
      userEmail: user.email
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireToken, async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const id = ObjectId.isValid(req.auth.sub) ? new ObjectId(req.auth.sub) : req.auth.sub;
    const user = await db.collection('users').findOne({ _id: id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.put('/update', requireToken, async (req, res, next) => {
  try {
    const firstName = String(req.body.firstName || req.body.name || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    if (!firstName) return res.status(400).json({ error: 'Name is required.' });

    const db = await connectToDatabase();
    const id = ObjectId.isValid(req.auth.sub) ? new ObjectId(req.auth.sub) : req.auth.sub;
    const fields = { firstName, updatedAt: new Date() };
    if (lastName) fields.lastName = lastName;

    const result = await db.collection('users').findOneAndUpdate(
      { _id: id },
      { $set: fields },
      { returnDocument: 'after', projection: { passwordHash: 0 }, includeResultMetadata: false }
    );
    if (!result) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: publicUser(result), message: 'Profile updated.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
module.exports.requireToken = requireToken;