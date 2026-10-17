require('dotenv').config();
const express = require('express');
const natural = require('natural');
const logger = require('./logger');

const app = express();
const port = Number(process.env.PORT) || 3000;
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

app.use(express.json({ limit: '32kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/sentiment', (req, res) => {
  const sentence = typeof req.body.sentence === 'string' ? req.body.sentence.trim() : '';
  if (!sentence) return res.status(400).json({ error: 'No sentence provided' });

  try {
    const sentimentScore = analyzer.getSentiment(sentence.split(/\s+/));
    const sentiment = sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral';
    logger.info({ sentimentScore, sentiment }, 'Sentiment analyzed');
    return res.status(200).json({ sentimentScore, sentiment });
  } catch (error) {
    logger.error({ err: error }, 'Error performing sentiment analysis');
    return res.status(500).json({ message: 'Error performing sentiment analysis' });
  }
});

if (require.main === module) {
  app.listen(port, () => logger.info('Sentiment service listening on port ' + port));
}

module.exports = { app };