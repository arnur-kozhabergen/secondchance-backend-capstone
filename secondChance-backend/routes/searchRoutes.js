const express = require('express');
const connectToDatabase = require('../models/db');

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
}

router.get('/', async (req, res, next) => {
  try {
    const query = {};
    const name = String(req.query.name || '').trim();
    const category = String(req.query.category || '').trim();
    const condition = String(req.query.condition || '').trim();
    const ageYears = req.query.age_years;

    if (name) query.name = { $regex: escapeRegex(name), $options: 'i' };
    if (category) query.category = { $regex: '^' + escapeRegex(category) + '$', $options: 'i' };
    if (condition) query.condition = { $regex: '^' + escapeRegex(condition) + '$', $options: 'i' };
    if (ageYears !== undefined && ageYears !== '') {
      const maxAge = Number(ageYears);
      if (!Number.isFinite(maxAge) || maxAge < 0) {
        return res.status(400).json({ error: 'age_years must be a non-negative number.' });
      }
      query.age_years = { $lte: maxAge };
    }

    const db = await connectToDatabase();
    const items = await db.collection('secondChanceItems').find(query).sort({ date_added: -1 }).toArray();
    return res.json(items);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;