const db = require('../db/connection.js');

module.exports.checkMealIdExists = async (meal_id) => {
  const mealIdExistsQuery = await db.query(
    'SELECT meal_id FROM meals WHERE meal_id = $1',
    [meal_id]
  );
  return mealIdExistsQuery.rowCount > 0;
};
