const { expect } = require('chai');
const request = require('supertest');
const { app } = require('../index');

describe('sentiment service', () => {
  it('returns a positive score for positive text', async () => {
    const response = await request(app).post('/sentiment').send({ sentence: 'I love this wonderful item' });
    expect(response.status).to.equal(200);
    expect(response.body.sentiment).to.equal('positive');
    expect(response.body.sentimentScore).to.be.greaterThan(0);
  });

  it('returns a negative score for negative text', async () => {
    const response = await request(app).post('/sentiment').send({ sentence: 'I hate this terrible item' });
    expect(response.status).to.equal(200);
    expect(response.body.sentiment).to.equal('negative');
    expect(response.body.sentimentScore).to.be.lessThan(0);
  });

  it('rejects an empty sentence', async () => {
    const response = await request(app).post('/sentiment').send({ sentence: '  ' });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.equal('No sentence provided');
  });
});