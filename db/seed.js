const db = require('./connection.js');
const usersData = require('./data/test-data/users.js');
const mealsData = require('./data/test-data/meals.js');
const format = require('pg-format');

async function seed() {
  await db.query('DROP TABLE IF EXISTS meals');
  await db.query('DROP TABLE IF EXISTS users');

  await db.query(
    `
      CREATE TABLE users
      (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(60) UNIQUE NOT NULL,
        date_joined DATE DEFAULT CURRENT_DATE 
      );
    `
  );

  await db.query(
    `
      CREATE TABLE meals
      (
        meal_id SERIAL PRIMARY KEY,
        created_by VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        name VARCHAR(255) NOT NULL,
        ingredients TEXT[] NOT NULL,
        source VARCHAR (255) NOT NULL,
        last_eaten DATE DEFAULT CURRENT_DATE
      );
    `
  );

  const insertUsersQuery = format(
    `
      INSERT INTO users
        (email, username, password)
      VALUES
      %L
    `,
    usersData.map((user) => {
      return [user.email, user.username, user.password];
    })
  );

  await db.query(insertUsersQuery);

  const insertMealsQuery = format(
    `
      INSERT INTO meals
        (created_by, name, ingredients, source)
      VALUES
      %L
    `,
    mealsData.map((meal) => {
      const formattedIngredients = `{${meal.ingredients.join(',')}}`;
      return [meal.created_by, meal.name, formattedIngredients, meal.source];
    })
  );

  await db.query(insertMealsQuery);
}

module.exports = seed;
