const { expect } = require('chai');
const request = require('supertest');
const { app } = require('../app');
const jwt = require('jsonwebtoken');

describe('backend API', () => {
  it('reports service health without a database round trip', async () => {
    const response = await request(app).get('/health');
    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('ok');
  });

  it('returns a JSON 404 for unknown API routes', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).to.equal(404);
    expect(response.body.error).to.equal('API endpoint not found.');
  });

  it('rejects invalid registration input before connecting to MongoDB', async () => {
    const response = await request(app).post('/api/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email: 'not-an-email',
      password: 'long-enough-password'
    });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.contain('valid email');
  });

  it('rejects invalid age filters without contacting the database', async () => {
    const response = await request(app).get('/api/secondchance/search?age_years=-1');
    expect(response.status).to.equal(400);
    expect(response.body.error).to.contain('non-negative number');
  });

  it('requires authentication to update and delete listings', async () => {
    for (const method of ['put', 'delete']) {
      const response = await request(app)[method]('/api/secondchance/items/example-id');
      expect(response.status).to.equal(401);
    }
  });

  it('rejects active content disguised as an image before database access', async () => {
    const token = jwt.sign({ sub: 'upload-security-test' },
      process.env.JWT_SECRET || 'local-development-secret-change-before-deploy');
    for (const [filename, contents] of [
      ['fake.html', '<script>alert(1)</script>'],
      ['fake.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>']
    ]) {
      const response = await request(app).post('/api/secondchance/items')
        .set('Authorization', 'Bearer ' + token)
        .field('name', 'Upload test').field('category', 'Test')
        .field('condition', 'Used').field('description', 'Security regression test')
        .attach('file', Buffer.from(contents), { filename, contentType: 'image/png' });
      expect(response.status).to.equal(400);
      expect(response.body.error).to.contain('valid PNG');
    }
  });
});
