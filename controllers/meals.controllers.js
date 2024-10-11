const {
  fetchMeals,
  fetchMealById,
  postMeal,
} = require('../models/meals.models.js');

module.exports.getMeals = async (req, res, next) => {
  try {
    const meals = await fetchMeals();
    res.status(200).send({ meals });
  } catch (err) {
    next(err);
  }
};

module.exports.getMealById = async (req, res, next) => {
  const { meal_id } = req.params;
  try {
    const fetchedMeal = await fetchMealById(meal_id);
    res.status(200).send({ meal: fetchedMeal });
  } catch (err) {
    next(err);
  }
};

module.exports.addMeal = async (req, res, next) => {
  const { meal } = req.body;
  try {
    const addedMeal = await postMeal(meal);
    res.status(201).send({ meal: addedMeal });
  } catch (err) {
    next(err);
  }
};
