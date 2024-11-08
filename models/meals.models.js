const db = require('../db/connection.js');
const { checkMealIdExists } = require('../utils/mealUtils.js');

module.exports.fetchMeals = async (
  sort_by = 'last_eaten',
  order_by = 'ASC'
) => {
  const validSortByQueries = ['last_eaten', 'name', 'source', 'rating'];
  const validOrderByQueries = ['ASC', 'DESC'];

  if (!validSortByQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: 'Invalid sort by query' });
  }

  if (!validOrderByQueries.includes(order_by)) {
    return Promise.reject({ status: 400, msg: 'Invalid order by query' });
  }

  const meals = (
    await db.query(`SELECT * FROM meals ORDER BY ${sort_by} ${order_by}`)
  ).rows;
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
      msg: 'Please provide a meal name.',
    });
  }

  if (!meal.ingredients.length) {
    return Promise.reject({
      status: 400,
      msg: "Please provide the meal's ingredients.",
    });
  }

  if (!meal.source) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a source for the meal.',
    });
  }

  if (!meal.rating) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a rating for the meal.',
    });
  }

  if (!meal.last_eaten) {
    return Promise.reject({
      status: 400,
      msg: 'Please provide a last_eaten date for the meal.',
    });
  }

  const formattedIngredients = `{${meal.ingredients.join(',')}}`;

  const addedMeal = (
    await db.query(
      `
      INSERT INTO meals
        (name, ingredients, source, created_by, image, rating, last_eaten)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
      [
        meal.name,
        formattedIngredients,
        meal.source,
        meal.created_by,
        meal.image || 'https://i.ibb.co/MDb6thH/Default-Meal.png',
        meal.rating,
        meal.last_eaten,
      ]
    )
  ).rows[0];

  return addedMeal;
};

module.exports.patchMeal = async (meal, meal_id) => {
  const mealIdExists = await checkMealIdExists(meal_id);

  if (!mealIdExists) {
    return Promise.reject({
      status: 404,
      msg: 'The meal with the specified meal_id was not found.',
    });
  }

  let query = 'UPDATE meals SET ';
  const queryParams = [];
  let queryIndex = 1;

  if (meal.name) {
    query += `name = $${queryIndex}, `;
    queryParams.push(meal.name);
    queryIndex++;
  }

  if (meal.ingredients) {
    query += `ingredients = $${queryIndex}, `;
    const formattedIngredients = `{${meal.ingredients.join(',')}}`;
    queryParams.push(formattedIngredients);
    queryIndex++;
  }

  if (meal.source) {
    query += `source = $${queryIndex}, `;
    queryParams.push(meal.source);
    queryIndex++;
  }

  if (meal.image) {
    query += `image = $${queryIndex}, `;
    queryParams.push(meal.image);
    queryIndex++;
  }

  if (meal.rating) {
    query += `rating = $${queryIndex}, `;
    queryParams.push(meal.rating);
    queryIndex++;
  }

  query = query.slice(0, -2);

  query += ` WHERE meal_id = $${queryIndex} RETURNING *;`;
  queryParams.push(meal_id);

  const updatedMeal = (await db.query(query, queryParams)).rows[0];

  return updatedMeal;
};

module.exports.deleteMeal = async (meal_id) => {
  const deleteMealQuery = (
    await db.query('DELETE FROM meals WHERE meal_id = $1', [meal_id])
  ).rowCount;

  if (!deleteMealQuery) {
    return Promise.reject({
      status: 404,
      msg: 'The meal with the specified meal_id does not exist.',
    });
  }

  return;
};
