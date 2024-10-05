const db = require('./connection.js');

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
        last_eaten DATE DEFAULT CURRENT_DATE
      );
    `
  );
}

module.exports = seed;
