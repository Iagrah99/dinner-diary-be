const request = require('supertest');
const app = require('../server');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');
const seed = require('../db/seed');

afterAll(() => db.end());

beforeEach(() => seed(data));

describe('GET /api/users', () => {
  test('status 200: should respond with an array of user objects with all their properties', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(Array.isArray(users)).toBe(true);
        users.forEach((user) => {
          expect(user).toMatchObject({
            user_id: expect.any(Number),
            email: expect.any(String),
            username: expect.any(String),
            avatar: expect.any(String),
          });
        });
      });
  });
});
