const db = require('../db/connection.js');

module.exports.fetchMeals = async () => {
  const meals = (await db.query('SELECT * FROM meals')).rows;

  return meals;
};
