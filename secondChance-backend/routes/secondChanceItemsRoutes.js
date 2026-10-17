const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const connectToDatabase = require('../models/db');
const logger = require('../logger');
const { requireToken } = require('./authRoutes');

const router = express.Router();
const imageDirectory = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(imageDirectory, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed.'));
    }
    return callback(null, true);
  }
});

function itemFilter(id) {
  return { id: String(id) };
}

function numeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

router.get('/', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const items = await db.collection('secondChanceItems').find({}).sort({ date_added: -1 }).toArray();
    return res.json(items);
  } catch (error) {
    logger.error({ err: error }, 'Could not load items');
    return next(error);
  }
});

router.post('/', requireToken, upload.single('file'), async (req, res, next) => {
  let savedImage;
  try {
    const name = String(req.body.name || '').trim();
    const category = String(req.body.category || '').trim();
    const condition = String(req.body.condition || '').trim();
    const description = String(req.body.description || '').trim();
    const zipcode = String(req.body.zipcode || '').trim();
    if (!name || !category || !condition || !description) {
      return res.status(400).json({ error: 'Name, category, condition, and description are required.' });
    }

    if (req.file) {
      try {
        const image = sharp(req.file.buffer, { limitInputPixels: 20000000 });
        const metadata = await image.metadata();
        if (!['png', 'jpeg', 'webp', 'gif'].includes(metadata.format)) {
          return res.status(400).json({ error: 'Upload a valid PNG, JPEG, WebP, or GIF image.' });
        }
        savedImage = crypto.randomUUID() + '.webp';
        await image.rotate().webp().toFile(path.join(imageDirectory, savedImage));
      } catch (error) {
        if (savedImage) await fs.promises.unlink(path.join(imageDirectory, savedImage)).catch(() => {});
        return res.status(400).json({ error: 'Upload a valid PNG, JPEG, WebP, or GIF image.' });
      }
    }

    const ageDays = numeric(req.body.age_days, 0);
    const item = {
      id: crypto.randomUUID(),
      name,
      category,
      condition,
      description,
      zipcode,
      ownerId: String(req.auth.sub),
      posted_by: String(req.auth.sub),
      date_added: Math.floor(Date.now() / 1000),
      age_days: ageDays,
      age_years: Number((ageDays / 365).toFixed(2)),
      image: savedImage ? '/uploads/' + savedImage : '',
      comments: []
    };

    const db = await connectToDatabase();
    await db.collection('secondChanceItems').insertOne(item);
    return res.status(201).json(item);
  } catch (error) {
    if (savedImage) await fs.promises.unlink(path.join(imageDirectory, savedImage)).catch(() => {});
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const item = await db.collection('secondChanceItems').findOne(itemFilter(req.params.id));
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireToken, async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'condition', 'description', 'zipcode', 'age_days'];
    const changes = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    if (changes.age_days !== undefined) {
      changes.age_days = numeric(changes.age_days, 0);
      changes.age_years = Number((changes.age_days / 365).toFixed(2));
    }
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'Provide at least one item field to update.' });
    }

    const db = await connectToDatabase();
    const result = await db.collection('secondChanceItems').findOneAndUpdate(
      { ...itemFilter(req.params.id), ownerId: String(req.auth.sub) },
      { $set: changes },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Item not found.' });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireToken, async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const deletedItem = await db.collection('secondChanceItems').findOneAndDelete({
      ...itemFilter(req.params.id), ownerId: String(req.auth.sub)
    }, { includeResultMetadata: false });
    if (!deletedItem) return res.status(404).json({ error: 'Item not found.' });
    if (typeof deletedItem.image === 'string' &&
        /^\/uploads\/[0-9a-f-]{36}\.webp$/i.test(deletedItem.image)) {
      const filename = path.basename(deletedItem.image);
      await fs.promises.unlink(path.join(imageDirectory, filename)).catch((error) => {
        if (error.code !== 'ENOENT') logger.warn({ err: error }, 'Could not remove deleted item image');
      });
    }
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
