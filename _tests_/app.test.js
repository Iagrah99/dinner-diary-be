const request = require('supertest');
const app = require('../server');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');
const seed = require('../db/seed');
const bcrypt = require('bcrypt');
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOjMsImVtYWlsIjoic3R1ZGVudF9mb29kaWVAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6IlN0dWRlbnRGb29kaWUiLCJhdmF0YXIiOiJodHRwczovL2kuaWJiLmNvL04zRnFMTTUvYXZhdGFyLTIucG5nIiwiZGF0ZV9qb2luZWQiOiIyMDI0LTEwLTA5VDIzOjAwOjAwLjAwMFoifSwiaWF0IjoxNzMwMzk5MDg2LCJleHAiOjE3MzA2NTgyODZ9.8H4781Mfb3pfSY6kaZ-_qgkWVd1hhPeHt8MXg3akF-c';

afterAll(() => db.end());

beforeEach(() => seed(data));

describe('GET /api/users', () => {
  test('status 200: should respond with an array of user objects with all their properties.', () => {
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

describe('GET /api/users/:user_id', () => {
  test('status 200: should respond with the user object with the specified user_id.', () => {
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

  test('status 400: should respond with a "Bad request" error when given an invalid user_id.', () => {
    return request(app)
      .get('/api/users/user1')
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a valid user_id.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent user_id.', () => {
    return request(app)
      .get('/api/users/50')
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The user with the specified user_id does not exist.');
      });
  });
});

describe('POST /api/users', () => {
  test('status 201: should successfully add a new user to the database and return the created user.', () => {
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
        expect(msg).toBe('A user with that email already exists.');
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
        expect(msg).toBe('A user with that username already exists.');
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
        expect(msg).toBe('Please provide an email.');
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
        expect(msg).toBe('Please provide a username.');
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
        expect(msg).toBe('Please provide a password.');
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

describe('GET /api/meals/:meal_id', () => {
  test('status 200: should respond with the requested meal object that is associated with the specified meal_id.', () => {
    return request(app)
      .get('/api/meals/1')
      .expect(200)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal).toMatchObject({
          meal_id: 1,
          name: 'Lentil Soup',
          ingredients: [
            'lentils',
            'carrots',
            'celery',
            'garlic',
            'vegetable broth',
          ],
          source: 'HealthyHeartyMeals.com',
          created_by: 'VeganGuru',
          image: 'https://i.ibb.co/k0NdDHF/Lentil-Soup.png',
        });
      });
  });

  test('status 400: should respond with a "Bad request" error when given an invalid meal_id.', () => {
    return request(app)
      .get('/api/meals/meal1')
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a valid meal_id.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent meal_id.', () => {
    return request(app)
      .get('/api/meals/100')
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The meal with the specified meal_id was not found.');
      });
  });
});

describe('POST /api/meals', () => {
  test('status 201: should successfully add a new meal to the database and return the created meal. ', () => {
    return request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Spaghetti Bolognese',
          ingredients: [
            'spaghetti',
            'ground beef',
            'tomato sauce',
            'onion',
            'garlic',
          ],
          source: 'BBC Good Food',
          created_by: 'TravelChef',
          image: 'https://i.ibb.co/CzRDcC3/Spaghetti-Bolognese.png',
        },
      })
      .expect(201)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal).toMatchObject({
          meal_id: 4,
          name: 'Spaghetti Bolognese',
          ingredients: [
            'spaghetti',
            'ground beef',
            'tomato sauce',
            'onion',
            'garlic',
          ],
          source: 'BBC Good Food',
          created_by: 'TravelChef',
          image: 'https://i.ibb.co/CzRDcC3/Spaghetti-Bolognese.png',
          last_eaten: expect.any(String),
        });
      });
  });

  test('status 201: should assign a default image for the meal if one is not specified by the user. ', () => {
    return request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Spaghetti Bolognese',
          ingredients: [
            'spaghetti',
            'ground beef',
            'tomato sauce',
            'onion',
            'garlic',
          ],
          source: 'BBC Good Food',
          created_by: 'TravelChef',
          image: '',
        },
      })
      .expect(201)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal.image).toBe('https://i.ibb.co/MDb6thH/Default-Meal.png');
      });
  });

  test('status 400: should respond with a "Bad request" error if no meal name is given', () => {
    return request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: '',
          ingredients: [
            'spaghetti',
            'ground beef',
            'tomato sauce',
            'onion',
            'garlic',
          ],
          source: 'BBC Good Food',
          created_by: 'TravelChef',
          image: 'https://i.ibb.co/CzRDcC3/Spaghetti-Bolognese.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Please provide a meal name.');
      });
  });

  test('status 400: should respond with a "Bad request" error if no ingredients given', () => {
    return request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Spaghetti Bolognese',
          ingredients: [],
          source: 'BBC Good Food',
          created_by: 'TravelChef',
          image: 'https://i.ibb.co/CzRDcC3/Spaghetti-Bolognese.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Please provide the meal's ingredients.");
      });
  });

  test('status 400: should respond with a "Bad request" error if no source is given', () => {
    return request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Spaghetti Bolognese',
          ingredients: [
            'spaghetti',
            'ground beef',
            'tomato sauce',
            'onion',
            'garlic',
          ],
          source: '',
          created_by: 'TravelChef',
          image: 'https://i.ibb.co/CzRDcC3/Spaghetti-Bolognese.png',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Please provide a source for the meal.');
      });
  });
});

describe('POST /api/users/login', () => {
  test('status 201: should respond with the user object that was created with their user details if provided correct login credentials ', () => {
    return request(app)
      .post('/api/users/login')
      .send({
        user: {
          username: 'TravelChef',
          password: 'adventure_chef321',
        },
      })
      .expect(201)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          user_id: 1,
          email: 'travel_chef@example.com',
          username: 'TravelChef',
          avatar: 'https://i.ibb.co/xfwj2n4/test-avatar-2.png',
          date_joined: expect.any(String),
        });
      });
  });

  test('status 400: should respond with a "Bad request" error when the given username is not associated with a registered account.', () => {
    return request(app)
      .post('/api/users/login')
      .send({
        user: {
          username: 'UnknownUser',
          password: 'MyPassword123!',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe(
          'There is no registered user account that is associated with that username'
        );
      });
  });

  test('status 400: should respond with a "Bad request" error when given an incorrect password.', () => {
    return request(app)
      .post('/api/users/login')
      .send({
        user: {
          username: 'TravelChef',
          password: 'Incorrect123!',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Incorrect password. Please try again!');
      });
  });

  test('status 400: should respond with a "Bad request" error when no username is provided.', () => {
    return request(app)
      .post('/api/users/login')
      .send({
        user: {
          username: '',
          password: 'adventure_chef321',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Please provide a username.');
      });
  });

  test('status 400: should respond with a "Bad request" error when no password is provided.', () => {
    return request(app)
      .post('/api/users/login')
      .send({
        user: {
          username: 'TravelChef',
          password: '',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Please provide a password.');
      });
  });
});

describe('PATCH /api/users/:user_id', () => {
  test("status 200: should successfully update the user's username, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          username: 'TravelCook',
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          user_id: 1,
          username: 'TravelCook',
          email: 'travel_chef@example.com',
          avatar: 'https://i.ibb.co/xfwj2n4/test-avatar-2.png',
          date_joined: expect.any(String),
        });
      });
  });

  test("status 200: should successfully update the user's password, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          password: 'adventure_cook123',
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        return bcrypt
          .compare('adventure_cook123', user.password)
          .then((passwordMatches) => {
            expect(passwordMatches).toBe(true);
            expect(user).toMatchObject({
              user_id: 1,
              email: 'travel_chef@example.com',
              username: 'TravelChef',
              avatar: 'https://i.ibb.co/xfwj2n4/test-avatar-2.png',
              date_joined: expect.any(String),
            });
            expect(user.password).not.toBe('adventure_cook123');
          });
      });
  });

  test("status 200: should successfully update the user's avatar, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          avatar: 'https://i.ibb.co/ggVSV42/Travel-Chef.png',
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          user_id: 1,
          email: 'travel_chef@example.com',
          username: 'TravelChef',
          avatar: 'https://i.ibb.co/ggVSV42/Travel-Chef.png',
          date_joined: expect.any(String),
        });
      });
  });

  test('status 400: should respond with a "Bad request" error if the new username is already taken. ', () => {
    return request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          username: 'VeganGuru',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('That username is already taken.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent user_id.', () => {
    return request(app)
      .patch('/api/users/100')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          username: 'NewUsername100',
        },
      })
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The user with the specified user_id does not exist.');
      });
  });
});

describe('PATCH /api/meals/:meal_id', () => {
  test("status 200: should successfully update the meal's name, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/meals/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Homemade Lentil Soup',
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal).toMatchObject({
          meal_id: 1,
          name: 'Homemade Lentil Soup',
          ingredients: [
            'lentils',
            'carrots',
            'celery',
            'garlic',
            'vegetable broth',
          ],
          source: 'HealthyHeartyMeals.com',
          created_by: 'VeganGuru',
          image: 'https://i.ibb.co/k0NdDHF/Lentil-Soup.png',
          last_eaten: expect.any(String),
        });
      });
  });

  test("status 200: should successfully update the meal's ingredients, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/meals/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          ingredients: [
            'lentils',
            'carrots',
            'celery',
            'garlic',
            'parsley', // New addition
            'vegetable broth',
          ],
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal).toMatchObject({
          meal_id: 1,
          name: 'Lentil Soup',
          ingredients: [
            'lentils',
            'carrots',
            'celery',
            'garlic',
            'parsley',
            'vegetable broth',
          ],
          source: 'HealthyHeartyMeals.com',
          created_by: 'VeganGuru',
          image: 'https://i.ibb.co/k0NdDHF/Lentil-Soup.png',
          last_eaten: expect.any(String),
        });
      });
  });

  test("status 200: should successfully update the meal's source, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/meals/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          source: 'BBC Good Food',
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal).toMatchObject({
          meal_id: 1,
          name: 'Lentil Soup',
          ingredients: [
            'lentils',
            'carrots',
            'celery',
            'garlic',
            'vegetable broth',
          ],
          source: 'BBC Good Food',
          created_by: 'VeganGuru',
          image: 'https://i.ibb.co/k0NdDHF/Lentil-Soup.png',
          last_eaten: expect.any(String),
        });
      });
  });

  test("status 200: should successfully update the meal's image, leaving the other properties unchanged.", () => {
    return request(app)
      .patch('/api/meals/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          image: 'https://i.ibb.co/18q4bXG/Lentil-Soup-2.png',
        },
      })
      .expect(200)
      .then(({ body }) => {
        const { meal } = body;
        expect(meal).toMatchObject({
          meal_id: 1,
          name: 'Lentil Soup',
          ingredients: [
            'lentils',
            'carrots',
            'celery',
            'garlic',
            'vegetable broth',
          ],
          source: 'HealthyHeartyMeals.com',
          created_by: 'VeganGuru',
          image: 'https://i.ibb.co/18q4bXG/Lentil-Soup-2.png',
          last_eaten: expect.any(String),
        });
      });
  });

  test('status 400: should respond with a "Bad request" error when given an invalid meal_id.', () => {
    return request(app)
      .patch('/api/meals/asdf')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Fish & Chips',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a valid meal_id.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent meal_id.', () => {
    return request(app)
      .patch('/api/meals/100')
      .set('Authorization', `Bearer ${token}`)
      .send({
        meal: {
          name: 'Beans on Toast',
        },
      })
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The meal with the specified meal_id was not found.');
      });
  });
});

describe('DELETE /api/users/:user_id', () => {
  test('status 204: should successfully delete the user with the specified user_id when given the correct password.', () => {
    return request(app)
      .delete('/api/users/3')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          password: 'coding_and_cooking789',
        },
      })
      .expect(204);
  });

  test('status 400: should respond with a "Bad request" error when given an invalid password.', () => {
    return request(app)
      .delete('/api/users/3')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: {
          password: 'cooking_and_coding987',
        },
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The password you provided is incorrect.');
      });
  });

  test('status 400: should respond with a "Bad request" error when given an invalid user_id.', () => {
    return request(app)
      .delete('/api/users/asdf')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a valid user_id.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent user_id.', () => {
    return request(app)
      .delete('/api/users/100')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send({
        user: {
          password: 'password_123',
        },
      })
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The user with the specified user_id does not exist.');
      });
  });
});

describe('DELETE /api/meals/:meal_id', () => {
  test('status 204: should successfully delete the meal with the specified meal_id.', () => {
    return request(app)
      .delete('/api/meals/3')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  test('status 400: should respond with a "Bad request" error when given an invaid meal_id.', () => {
    return request(app)
      .delete('/api/meals/abc')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('Bad request. Please provide a valid meal_id.');
      });
  });

  test('status 404: should respond with a "Not found" error when given a valid but non-existent meal_id.', () => {
    return request(app)
      .delete('/api/meals/100')
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe('The meal with the specified meal_id does not exist.');
      });
  });
});
