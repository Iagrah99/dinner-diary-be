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

module.exports.postMeal = async (meal) => {
  if (!meal.name) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. Please provide a meal name.',
    });
  }

  if (!meal.ingredients.length) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Please provide the meal's ingredients.",
    });
  }

  if (!meal.source) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request. Please provide a source for the meal.',
    });
  }

  const formattedIngredients = `{${meal.ingredients.join(',')}}`;

  const addedMeal = (
    await db.query(
      `
      INSERT INTO meals
        (name, ingredients, source, created_by, image)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
      [
        meal.name,
        formattedIngredients,
        meal.source,
        meal.created_by,
        meal.image || 'https://i.ibb.co/MDb6thH/Default-Meal.png',
      ]
    )
  ).rows[0];

  return addedMeal;
};
