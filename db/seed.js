const db = require('./connection.js');
const format = require('pg-format');
const bcrypt = require('bcrypt');

async function seed({ usersData, mealsData }) {
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
        avatar VARCHAR(100) NOT NULL,
        date_joined DATE NOT NULL 
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
        source VARCHAR(255) NOT NULL,
        image VARCHAR(100) NOT NULL,
        rating real NOT NULL,
        last_eaten DATE NOT NULL
      );
    `
  );

  const hashedUsersData = await Promise.all(
    usersData.map(async (user) => {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user.password, salt);

      return [
        user.email,
        user.username,
        hashedPassword,
        user.avatar,
        user.date_joined,
      ];
    })
  );

  const insertUsersQuery = format(
    `
      INSERT INTO users
        (email, username, password, avatar, date_joined)
      VALUES
      %L
    `,
    hashedUsersData
  );

  await db.query(insertUsersQuery);

  const insertMealsQuery = format(
    `
      INSERT INTO meals
        (created_by, name, ingredients, source, image, rating, last_eaten)
      VALUES
      %L
    `,
    mealsData.map((meal) => {
      const formattedIngredients = `{${meal.ingredients.join(',')}}`;
      return [
        meal.created_by,
        meal.name,
        formattedIngredients,
        meal.source,
        meal.image,
        meal.rating,
        meal.last_eaten,
      ];
    })
  );

  await db.query(insertMealsQuery);
}

module.exports = seed;
