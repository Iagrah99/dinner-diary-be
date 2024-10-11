const request = require('supertest');
const app = require('../server');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');
const seed = require('../db/seed');
const bcrypt = require('bcrypt');

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

describe('POST /api/users', () => {
  test('status 201: should successfully add a new user to the database and return the created user', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: 'mealplanner_mum@example.com',
          username: 'MealPlannerMum',
          password: 'strong_password123',
          avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
        },
      })
      .expect(201)
      .then(({ body }) => {
        const { user } = body;

        return bcrypt
          .compare('strong_password123', user.password)
          .then((passwordMatches) => {
            expect(passwordMatches).toBe(true);
            expect(user).toMatchObject({
              email: 'mealplanner_mum@example.com',
              username: 'MealPlannerMum',
              avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
            });
            expect(user.password).not.toBe('strong_password123');
          });
      });
  });

  test('status 201: should assign a default avatar if one is not specified by the user.', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: 'mealplanner_mum@example.com',
          username: 'MealPlannerMum',
          password: 'strong_password123',
          avatar: '',
        },
      })
      .expect(201)
      .then(({ body }) => {
        const { user } = body;
        expect(user.avatar).toBe('https://i.ibb.co/xmZqs9Y/default-avatar.png');
      });
  });

  test('status 400: should respond with a "Bad request" error if a user with the specified email already exists.', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: 'travel_chef@example.com',
          username: 'MealPlannerMum',
          password: 'strong_password123',
          avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. A user with that email already exists.');
      });
  });

  test('status 400: should respond with a "Bad request" error if a user with the specified username already exists.', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: 'mealplanner_mum@example.com',
          username: 'TravelChef',
          password: 'strong_password123',
          avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe(
          'Bad request. A user with that username already exists.'
        );
      });
  });

  test('status 400: should respond with a "Bad request" error if no user email is provided.', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: '',
          username: 'MealPlannerMum',
          password: 'strong_password123',
          avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide an email.');
      });
  });

  test('status 400: should respond with a "Bad request" error if no username is provided.', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: 'mealplanner_mum@example.com',
          username: '',
          password: 'strong_password123',
          avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a username.');
      });
  });

  test('status 400: should respond with a "Bad request" error if no password is provided.', () => {
    return request(app)
      .post('/api/users')
      .send({
        user: {
          email: 'mealplanner_mum@example.com',
          username: 'MealPlannerMum',
          password: '',
          avatar: 'https://i.ibb.co/tsDn7jg/avatar-1.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a password.');
      });
  });
});

describe('GET /api/meals', () => {
  test('status 200: should respond with an array of meal objects with all of their properties.', () => {
    return request(app)
      .get('/api/meals')
      .expect(200)
      .then(({ body }) => {
        const { meals } = body;
        expect(Array.isArray(meals)).toBe(true);
        meals.forEach((meal) => {
          expect(meal).toMatchObject({
            meal_id: expect.any(Number),
            name: expect.any(String),
            source: expect.any(String),
            created_by: expect.any(String),
            image: expect.any(String),
          });
          expect(Array.isArray(meal.ingredients)).toBe(true);
        });
      });
  });
});
