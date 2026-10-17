require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./logger');
const connectToDatabase = require('./models/db');
const { loadData } = require('./util/import-mongo');

const authRoutes = require('./routes/authRoutes');
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const frontendBuild = path.join(__dirname, '..', 'secondChance-frontend', 'build');

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
}));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  maxAge: '7d',
  immutable: true
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  maxAge: '7d', immutable: true,
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));
app.use('/api/auth', authRoutes);
app.use('/api/secondchance/items', secondChanceItemsRoutes);
app.use('/api/secondchance/search', searchRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use(express.static(frontendBuild));
app.get('*', (req, res, next) => {
  res.sendFile(path.join(frontendBuild, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  if (error.name === 'MulterError' || error.message === 'Only image files are allowed.') {
    return res.status(400).json({ error: error.message });
  }
  logger.error({ err: error }, 'Request failed');
  return res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  const db = await connectToDatabase();
  await loadData(db);
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  const port = Number(process.env.PORT) || 3060;
  return app.listen(port, () => logger.info('SecondChance listening on port ' + port));
}

if (require.main === module) {
  start().catch((error) => {
    logger.error({ err: error }, 'Could not start the server');
    process.exitCode = 1;
  });
}

module.exports = { app, start };
