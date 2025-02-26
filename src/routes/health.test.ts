import { FastifyInstance } from 'fastify';
import { buildApp } from '../app';

describe('Health Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return status 200 and health information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const payload = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(payload.status).toBe('ok');
      expect(payload).toHaveProperty('timestamp');
      expect(payload).toHaveProperty('environment');
      expect(payload).toHaveProperty('service', 'content-calendar-ideas-api');
      expect(payload).toHaveProperty('uptime');
    });
  });

  describe('GET /status', () => {
    it('should return status 200 and detailed system information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/status',
      });

      const payload = JSON.parse(response.payload);

      expect(response.statusCode).toBe(200);
      expect(payload.status).toBe('ok');
      expect(payload).toHaveProperty('timestamp');
      expect(payload).toHaveProperty('environment');
      expect(payload).toHaveProperty('memory');
    });
  });
}); 