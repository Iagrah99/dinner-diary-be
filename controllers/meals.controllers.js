const {
  fetchMeals,
  fetchMealById,
  postMeal,
  patchMeal,
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

module.exports.updateMeal = async (req, res, next) => {
  const { meal } = req.body;
  const { meal_id } = req.params;
  try {
    const updatedMeal = await patchMeal(meal, meal_id);
    res.status(200).send({ meal: updatedMeal });
  } catch (err) {
    next(err);
  }
};
