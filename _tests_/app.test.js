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

describe('GET /api/users/user_id', () => {
  test('status 200: should respond with the user object with the specified user_id', () => {
    return request(app)
      .get('/api/users/1')
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          user_id: 1,
          email: 'travel_chef@example.com',
          username: 'TravelChef',
          avatar: 'https://i.ibb.co/xfwj2n4/test-avatar-2.png',
        });
      });
  });

  test('status 400: should respond with a "Bad request" error when given an invalid user_id', () => {
    return request(app)
      .get('/api/users/user1')
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a valid user_id.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent user_id', () => {
    return request(app)
      .get('/api/users/50')
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The user with the specified user_id was not found.');
      });
  });
});
