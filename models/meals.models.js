const db = require('../db/connection.js');

module.exports.fetchMeals = async () => {
  const meals = (await db.query('SELECT * FROM meals')).rows;
  return meals;
};

module.exports.fetchMealById = async (meal_id) => {
  const meal = (
    await db.query('SELECT * FROM meals WHERE meal_id = $1', [meal_id])
  ).rows[0];

  if (!meal) {
    return Promise.reject({
      status: 404,
      msg: 'The meal with the specified meal_id was not found.',
    });
  }

  return meal;
};
